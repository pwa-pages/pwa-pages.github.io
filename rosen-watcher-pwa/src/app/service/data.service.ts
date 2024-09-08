import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DownloadService } from './download.service';
import { ChainService } from './chain.service';
import { EventService, EventType } from './event.service';
import { catchError, firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Input } from '../models/input';
import { Address } from '../models/address';
import { Asset } from '../models/asset';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  readonly initialNDownloads: number = 50;
  readonly fullDownloadsBatchSize: number = 200;
  busyCounter = 0;

  constructor(
    private storageService: StorageService,
    private downloadService: DownloadService,
    private eventService: EventService<string>,
    private chainService: ChainService,
    private snackBar: MatSnackBar,
  ) {}

  async getWatcherInputs(): Promise<Input[]> {
    const inputsPromise = this.storageService.getInputs();

    try {
      const inputs = await inputsPromise;

      const result_1 = inputs
        .filter((i: Input) => this.chainService.getChainType(i.address) != null)
        .sort((a, b) => b.outputCreatedAt - a.outputCreatedAt);

      result_1.forEach((input: Input) => {
        input.assets = input.assets
          .filter((asset: Asset) => asset.name === 'RSN' || asset.name === 'eRSN')
          .map((asset_1: Asset) => {
            return asset_1;
          });
      });

      return await new Promise<Input[]>((resolve) => {
        resolve(result_1);
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getInputs(): Promise<Input[]> {
    return this.storageService.getInputs();
  }

  async getTotalRewards(): Promise<string> {
    const inputsPromise = this.getWatcherInputs();

    try {
      const inputs = await inputsPromise;
      const sum: number = inputs.reduce((accumulator, o) => {
        let assetAmount = 0;

        o.assets.forEach((asset: Asset) => {
          assetAmount += asset.amount / Math.pow(10, asset.decimals);
        });

        return accumulator + assetAmount;
      }, 0);

      return await new Promise<string>((resolve) => {
        resolve(sum.toFixed(3));
      });
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  async getSortedInputs(): Promise<Input[]> {
    const inputsPromise = this.getWatcherInputs();
    let amount = 0;
    const sortedInputs: Input[] = [];
    console.log('start retrieving chart from database');
    try {
      const inputs = await inputsPromise;

      inputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());

      inputs.forEach((input: Input) => {
        input.assets.forEach((asset: Asset) => {
          amount += asset.amount;
          sortedInputs.push(
            new Input(
              input.inputDate,
              input.address,
              input.outputCreatedAt,
              input.assets,
              input.outputAddress,
              input.boxId,
              amount,
              asset.amount / Math.pow(10, asset.decimals),
              this.chainService.getChainType(input.address),
            ),
          );
        });
      });
      console.log('done retrieving chart from database ' + inputs.length + ' inputs');
      return await new Promise<Input[]>((resolve) => {
        resolve(sortedInputs);
      });
    } catch (error) {
      console.error(error);
      return sortedInputs;
    }
  }



  private IncreaseBusyCounter(): void {
    if (this.busyCounter == 0) {
      this.eventService.sendEvent(EventType.StartFullDownload);
    }
    this.busyCounter++;
  }

  private DecreasBusyCounter(): void {
    this.busyCounter--;
    if (this.busyCounter == 0) {
      this.eventService.sendEvent(EventType.EndFullDownload);
    }
  }

  private async downloadAllForAddress(address: string, offset: number) {
    this.IncreaseBusyCounter();
    console.log(this.busyCounter);
    const s = this.downloadService.downloadTransactions(
      address,
      offset,
      this.fullDownloadsBatchSize + 10,
    );

    const result = await firstValueFrom(
      s.pipe(
        catchError((e) => {
          this.DecreasBusyCounter();
          throw e;
        }),
      ),
    );

    console.log(
      'Processing all download(offset = ' +
        offset +
        ', size = ' +
        this.fullDownloadsBatchSize +
        ') for: ' +
        address,
    );

    if (!result.transactions || result.transactions.length == 0) {
      this.DecreasBusyCounter();
      console.log(this.busyCounter);
      return;
    }

    if (offset > 100000) {
      this.DecreasBusyCounter();
      console.log(this.busyCounter);
      console.log('this gets out of hand');
      return;
    }

    await this.storageService.addData(address, result.transactions);

    await this.downloadAllForAddress(address, offset + this.fullDownloadsBatchSize);
    this.DecreasBusyCounter();
    console.log(this.busyCounter);
  }

  public async downloadForAddress(
    address: string,
    storageService: StorageService,
    hasAddressParams: boolean,
  ) {
    this.IncreaseBusyCounter();
    console.log(this.busyCounter);

    const s = this.downloadService.downloadTransactions(address, 0, this.initialNDownloads);
    const result = await firstValueFrom(
      s.pipe(
        catchError((e) => {
          if (hasAddressParams) {
            this.snackBar.open(
              'Some download(s) failed, check your addresses, not all of them might be correct, or service may have issues',
              'Close',
              {
                duration: 5000,
                panelClass: ['custom-snackbar'],
              },
            );
          }

          this.DecreasBusyCounter();
          throw e;
        }),
      ),
    );

    console.log(
      'Processing initial download(size = ' + this.initialNDownloads + ') for: ' + address,
    );

    const itemsz = result.transactions.length;
    let halfBoxId = '';

    if (itemsz > this.initialNDownloads / 2) {
      for (let i = Math.floor(itemsz / 2); i < itemsz; i++) {
        const item = result.transactions[i];

        for (const input of item.inputs) {
          if (input.boxId && halfBoxId === '') {
            halfBoxId = input.boxId;
          }
        }
      }
    }
    const boxId = await storageService.getDataByBoxId(halfBoxId, address);

    console.log('add bunch of data');
    await storageService.addData(address, result.transactions);

    if (boxId) {
      console.log(
        'Found existing boxId in db for download for: ' + address + ',no need to download more.',
      );
    }
    if (!boxId && itemsz >= this.initialNDownloads) {
      console.log("Downloading all tx's for : " + address);

      await this.downloadAllForAddress(address, 0);
    }

    this.DecreasBusyCounter();
    console.log(this.busyCounter);
  }

  async getAddresses(): Promise<Address[]> {
    return await this.storageService.getAddressData();
  }

  async getAddressesForDisplay(): Promise<Address[]> {
    const addresses = this.getAddressesFromInputs();

    return addresses.then((addresses) => {
      const result: Address[] = [];
      addresses.forEach((a: Address) => {
        result.push({
          address: a.address.substring(0, 6) + '...',
          chainType: a.chainType,
        });
      });

      result.sort((a, b) =>
        (a.chainType != null ? a.chainType : '').localeCompare(
          b.chainType != null ? b.chainType : '',
        ),
      );

      return result;
    });
  }

  async getAddressesFromInputs(): Promise<Address[]> {
    const inputsPromise = this.getWatcherInputs();
    const addresses: Address[] = [];

    try {
      const inputs = await inputsPromise;

      inputs.forEach((input: Input) => {
        if (!addresses.some((address) => address.address == input.outputAddress)) {
          addresses.push({
            address: input.outputAddress,
            chainType: this.chainService.getChainType(input.address),
          });
        }
      });

      return await new Promise<Address[]>((resolve) => {
        resolve(addresses);
      });
    } catch (error) {
      console.error(error);
      return addresses;
    }
  }
}
