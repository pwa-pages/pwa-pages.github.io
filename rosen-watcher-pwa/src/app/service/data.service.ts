import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DownloadService } from './download.service';
import { ChainService } from './chain.service';
import { EventService, EventType } from './event.service';
import { catchError, firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Input } from '../models/input';
import { Address } from '../models/address';

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
    private eventService: EventService,
    private chainService: ChainService,
    private snackBar: MatSnackBar,
  ) {}

  async getWatcherInputs(): Promise<Input[]> {
    const inputsPromise = this.storageService.getInputs();

    try {
      const inputs = await inputsPromise;

      const result_1 = inputs
        .filter((i: any) => this.chainService.getChainType(i.address) != null)
        .sort((a, b) => b.outputCreatedAt - a.outputCreatedAt);

      result_1.forEach((input: any) => {
        input.assets = input.assets
          .filter((asset: any) => asset.name === 'RSN' || asset.name === 'eRSN')
          .map((asset_1: any) => {
            return asset_1;
          });
      });

      return await new Promise<any[]>((resolve) => {
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

        o.assets.forEach((asset: any) => {
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

  async getSortedInputs(): Promise<any[]> {
    const inputsPromise = this.getWatcherInputs();
    let amount = 0;
    const sortedInputs: any = [];
    console.log('start retrieving chart from database');
    try {
      const inputs = await inputsPromise;

      inputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());

      inputs.forEach((input: any) => {
        input.assets.forEach((asset: any) => {
          amount += asset.amount;
          sortedInputs.push({
            inputDate: input.inputDate,
            accumulatedAmount: amount,
            amount: asset.amount / Math.pow(10, asset.decimals),
            chainType: this.chainService.getChainType(input.address),
          });
        });
      });
      console.log('done retrieving chart from database ' + inputs.length + ' inputs');
      return await new Promise<string[]>((resolve) => {
        resolve(sortedInputs);
      });
    } catch (error) {
      console.error(error);
      return sortedInputs;
    }
  }

  async getAddressesForDisplay(): Promise<any[]> {
    const addresses = this.getAddresses();

    return addresses.then((addresses) => {
      const result: any[] = [];
      addresses.forEach((a: any) => {
        result.push({
          address: a.address.substring(0, 6) + '...',
          chainType: a.chainType,
        });
      });

      result.sort((a, b) => a.chainType.localeCompare(b.chainType));

      return result;
    });
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

        for (let j = 0; j < item.inputs.length; j++) {
          if (item.inputs[j].boxId && halfBoxId == '') {
            halfBoxId = item.inputs[j].boxId;
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

  async getAddressData(): Promise<any[]> {
    const addressesPromise = this.storageService.getAddressData();
    const resolvedAddresses = await this.getAddresses();
    const result: any[] = [];

    try {
      const addresses = await addressesPromise;

      addresses.forEach((address: any) => {
        if (resolvedAddresses.indexOf(address.address) >= 0) {
          if (address.address.length > 14) {
            address.addressForDisplay =
              address.address.substring(0, 6) +
              ' ... ' +
              address.address.substring(address.address.length - 6, address.address.length);
          } else {
            address.addressForDisplay = address.address;
          }

          result.push(address);
        }
      });

      return await new Promise<string[]>((resolve) => {
        resolve(result);
      });
    } catch (error) {
      console.error(error);
      return addressesPromise;
    }
  }

  async getAddresses(): Promise<Address[]> {
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
