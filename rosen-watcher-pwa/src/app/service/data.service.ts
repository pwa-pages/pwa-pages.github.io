import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DownloadService } from './download.service';
import { ChainService } from './chain.service';
import { EventService, EventType } from './event.service';
import { catchError, firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  readonly initialNDownloads: number = 50;
  readonly fullDownloadsBatchSize: number = 200;
  busyCounter: number = 0;

  constructor(
    private storageService: StorageService,
    private downloadService: DownloadService,
    private eventService: EventService,
    private chainService: ChainService,
    private snackBar: MatSnackBar,
  ) {}

  async getWatcherInputs(): Promise<any[]> {
    var inputsPromise = this.storageService.getInputs();

    try {
      const inputs = await inputsPromise;

      var result_1 = inputs
        .filter((i: any) => this.chainService.getChainType(i.address) != null)
        .sort((a, b) => b.outputCreatedAt - a.outputCreatedAt);

      result_1.forEach((input: any) => {
        input.assets = input.assets
          .filter((asset: any) => asset.name === 'RSN')
          .map((asset_1: any) => {
            return asset_1;
          });
      });

      return await new Promise<any[]>((resolve, reject) => {
        resolve(result_1);
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getInputs(): Promise<any[]> {
    return this.storageService.getInputs();
  }

  async getTotalRewards(): Promise<string> {
    var inputsPromise = this.getWatcherInputs();

    try {
      const inputs = await inputsPromise;
      var sum: number = inputs.reduce((accumulator, o) => {
        var assetAmount = 0;

        o.assets.forEach((asset: any) => {
          assetAmount += asset.amount / Math.pow(10, asset.decimals);
        });

        return accumulator + assetAmount;
      }, 0);

      return await new Promise<string>((resolve, reject) => {
        resolve(sum.toFixed(3));
      });
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  async getSortedInputs(): Promise<any[]> {
    var inputsPromise = this.getWatcherInputs();
    var amount = 0;
    var sortedInputs: any = [];
    console.log('start retrieving chart from database');
    try {
      const inputs = await inputsPromise;

      inputs.sort((a, b) => a.inputDate - b.inputDate);

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
      console.log('done retrieving chart from database');
      return await new Promise<string[]>((resolve, reject) => {
        resolve(sortedInputs);
      });
    } catch (error) {
      console.error(error);
      return sortedInputs;
    }
  }

  async getPerformanceChart(): Promise<any[]> {
    var inputsPromise = this.getWatcherInputs();
    var performanceChart: any = [];

    console.log('start retrieving chart from database');
    try {
      const inputs = await inputsPromise;
      var addressCharts: any = {};

      inputs.sort((a, b) => a.inputDate - b.inputDate);

      var chainTypes: any = {};

      inputs.forEach((input: any) => {
        input.assets.forEach((asset: any) => {
          if (!addressCharts[input.outputAddress]) {
            addressCharts[input.outputAddress] = {};
          }

          const currentDate = new Date();
          const halfYearAgo = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 6,
            currentDate.getDate(),
          );

          if (input.inputDate > halfYearAgo) {
            var dt = new Date(
              input.inputDate.getFullYear(),
              input.inputDate.getMonth(),
              input.inputDate.getDate() - input.inputDate.getDay(),
            ).getTime();
            if (!addressCharts[input.outputAddress][dt]) {
              addressCharts[input.outputAddress][dt] = 0;
            }

            addressCharts[input.outputAddress][dt] += asset.amount / Math.pow(10, asset.decimals);
            chainTypes[input.outputAddress] = this.chainService.getChainType(input.address);
          }
        });
      });

      performanceChart = [];

      for (const key in addressCharts) {
        if (addressCharts.hasOwnProperty(key)) {
          var chart: any[] = [];
          for (const ckey in addressCharts[key]) {
            chart.push({
              x: new Date(Number(ckey)),
              y: addressCharts[key][ckey],
            });
          }
          var addressForDisplay =
            key.substring(0, 6) + '...' + key.substring(key.length - 6, key.length);
          performanceChart.push({
            address: key,
            addressForDisplay: addressForDisplay,
            chart: chart,
            chainType: chainTypes[key],
          });
        }
      }

      // Sort the performanceChart array by chainType
      performanceChart.sort((a: any, b: any) => a.chainType.localeCompare(b.chainType));

      console.log('done retrieving chart from database');
      return await new Promise<any[]>((resolve, reject) => {
        resolve(performanceChart);
      });
    } catch (error) {
      console.error(error);
      return performanceChart;
    }
  }

  async getAddressesForDisplay(): Promise<any[]> {
    var addresses = this.getAddresses();

    return addresses.then((addresses) => {
      var result: any[] = [];
      addresses.forEach((a: any) => {
        result.push({
          address: a.address.substring(0, 6) + '...',
          chainType: a.chainType,
        });
      });

      // Sort the result array by chainType
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
    var s = this.downloadService.downloadTransactions(
      address,
      offset,
      this.fullDownloadsBatchSize + 10,
    );

    var result = await firstValueFrom(
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

    if (offset > 10000) {
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
    inputs: any[],
    storageService: StorageService,
    hasAddressParams: boolean,
  ) {
    this.IncreaseBusyCounter();
    console.log(this.busyCounter);

    var s = this.downloadService.downloadTransactions(address, 0, this.initialNDownloads);
    var result = await firstValueFrom(
      s.pipe(
        catchError((e) => {
          if (hasAddressParams) {
            this.snackBar.open(
              'Some download(s) failed, possibly some addresses were not added',
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

    var itemsz = result.transactions.length;
    var halfBoxId: string = '';

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
    var boxId = await storageService.getDataByBoxId(halfBoxId, address);

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
    var addressesPromise = this.storageService.getAddressData();
    var resolvedAddresses = await this.getAddresses();
    var result: any[] = [];

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

      return await new Promise<string[]>((resolve, reject) => {
        resolve(result);
      });
    } catch (error) {
      console.error(error);
      return addressesPromise;
    }
  }

  async getAddresses(): Promise<any[]> {
    var inputsPromise = this.getWatcherInputs();
    var addresses: any[] = [];

    try {
      const inputs = await inputsPromise;

      inputs.forEach((input: any) => {
        if (!addresses.some((address) => address.address == input.outputAddress)) {
          addresses.push({
            address: input.outputAddress,
            chainType: this.chainService.getChainType(input.address),
          });
        }
      });

      return await new Promise<string[]>((resolve, reject) => {
        resolve(addresses);
      });
    } catch (error) {
      console.error(error);
      return addresses;
    }
  }
}
