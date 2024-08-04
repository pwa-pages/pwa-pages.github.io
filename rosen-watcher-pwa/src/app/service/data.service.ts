import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DownloadService } from './download.service';
import { EventService, EventType } from './event.service';
import { catchError, firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export enum ChainType {
  Bitcoin = 'Bitcoin',
  Cardano = 'Cardano',
  Ergo = 'Ergo',
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  readonly rewardsCardanoAddress: string =
    '2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUskGdVdyYY5RBJnp3dfYC7iPoRNeopAFQWFwEbTieow347UhRyqvo2LntFpXzomvGwVTfq9YXS8Z1GGW5mUEioD5xC17Sz72NLbQrskSx7QZAxQTbMGh6vwM9J4q7NzRmQeHmWaHLpUHMU4Jdd5ccKumMvAY8d5C8RxB4iATySLY2N1wY84qNsWNaqkNofbUebf6LgmU9HTKAmU3nDoBfX7mhCjH8kXDhZeYdRsuLVFEYu83TkpwgHAYGmUoemxWAeA2BKMx8CBAy9jxbCyUjdnk9i7sLxuejrwLLh8W4tP81YkESjZ8BV65BhzPdvCaiX8vBSorgFfnvGKVzwfhhsSDwLY1GUwLTMLwTUTjSzEjsMX9hzsEEEmhxLsekabLmK3HZ1jssLrFryNuE59uS51hazJsi3gsT8SBk1J9YV6Dq6xto28nLqrMqK6raqLcAm2iU8hBtqdoSXqWzsrZHpqc2uLGhY52ee4k9TpFBvN1RovYUtY6KS4FncT4UgnbEFkzsnWYKX3CDn16tJs5CyZ97gKcvUonZ5EqTwabzni14CcQsTtKtEAqj1odvSyfJ94NnEjuiVPC3VmZbQvveN3bQ';
  readonly rewardsBitcoinAddress: string =
    '2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUpyGNdkxhFwQMhPKpx85Uu16put68V837wxDx19LRJ5uqi7xBa7EDFRU79Grzk8HDrfpUF3qct4xrQUvDofDroRQTuKueAbwybAfGDhNqG3jzKQchgjedBkbPAuDuNunehW4ZXUBLRSfqy3xofV76bxT5zpZjZcKud4XaRQvXUAVGunJzAs7RNZD5WZxenhmKzhiyuzWiq5QkWqxFw2h9vQ6Dd5PdYsWP3dPtaDC8WUjGz8tQ1tU9LuhqZ8QThQA5zBfoPFrk2iJ1repUuwZPjWnDRHLfWppqDQJGm2GEWHmYTQAfCJQFChUtSNstSATxw37xXjziKkPQRRVPr3VPapbHtGSoQyygzTHgcjxv3HSzwXkD7DScyA2iGDsd4B4WeXo4a6nM4CYpxa9f9FvabbNByhKsgq3ZoCsbUVXN99Pet93MFdxVmBBEsGYEYvtmMEDZEGb5z3JZDtVSdudFcm3bij82bdFzKSmmxxWZhscmLYpGGq1J5geqTiyTCgsmksAHumPFBmLkz8v843Jc3z5b6dwFgyXuBmQPTq6Nf8t95y1UYe8UYx3qNVfrHSGbToSgvCQyLKVv5ns8T2SZRWWr';
  readonly rewardsErgoAddress: string =
    '2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUmvtxr3QSv1aLwThLXxeqYCCc34xjxZDPqPyNGYvWLNeBZxATvBeDuQ6pSiiRFknqmvYVsm9eH4Et3eRHCyxDJEoqZsAahwfVSya34dZNHmjaPQkwWo3Coc17pxiEnWuWmG38wSJz1awE6cymzhojnjxDTbbXgjR1yfYU3AU2v9zttnT8Gz3gUzZNSwjiXSPu3G9zkDaFZVKqb5QwTWY3Pp6SFJgBQfx3C3sp4a9d3n9c98pfWFWAGQN5EfkoHosF8BQTDuzXG3NU8gVCNeNPXYA8iWCbvY3XpxQMvQUxqkjDv9VQfUNvAKVHLW43chi2rdBrQ7Teu6NnesLRWUKXpzSxpByWftkCCdBppjZtYmhhCHqpQGkQyTcMRoP2krFKe7xKbfnFkdkhaYH9TTdKuTuKtGb265RXxiqrc34KvkZpaBBQB5UvoCU4iLSDngNTjqkNPnWekDahzNHLd6CtcdC1B19jdGEXWeNADemDtdK4zrMNg7U8iVpyGYhLDnkeLVrcbhoxkHxrFwfrN19XvitDosQqmt9dseR6SWHBCDZJdmJecCiEwd2wBiwN5N5umEy3Dd4Hznv7kDr6eX7KtYxp';
  readonly initialNDownloads: number = 50;
  readonly fullDownloadsBatchSize: number = 200;
  busyCounter: number = 0;

  constructor(
    private storageService: StorageService,
    private downloadService: DownloadService,
    private eventService: EventService,
    private snackBar: MatSnackBar,
  ) {}

  getChainType(address: string) {
    switch (address) {
      case this.rewardsCardanoAddress:
        return ChainType.Cardano;
      case this.rewardsBitcoinAddress:
        return ChainType.Bitcoin;
      case this.rewardsErgoAddress:
        return ChainType.Ergo;
    }
    return null;
  }

  async getWatcherInputs(): Promise<any[]> {
    var inputsPromise = this.storageService.getInputs();

    try {
      const inputs = await inputsPromise;

      var result_1 = inputs
        .filter((i: any) => this.getChainType(i.address) != null)
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

  async getRewardsChart(): Promise<any[]> {
    var inputsPromise = this.getWatcherInputs();
    var amount = 0;
    var rewardsChart: any = [];
    console.log('start retrieving chart from database');
    try {
      const inputs = await inputsPromise;

      inputs.sort((a, b) => a.inputDate - b.inputDate);

      inputs.forEach((input: any) => {
        input.assets.forEach((asset: any) => {
          amount += asset.amount;
          rewardsChart.push({ x: input.inputDate, y: amount });
        });
      });
      console.log('done retrieving chart from database');
      return await new Promise<string[]>((resolve, reject) => {
        resolve(rewardsChart);
      });
    } catch (error) {
      console.error(error);
      return rewardsChart;
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

            addressCharts[input.outputAddress][dt] +=
              asset.amount / Math.pow(10, asset.decimals);
            chainTypes[input.outputAddress] = this.getChainType(input.address);
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
            key.substring(0, 6) +
            '...' +
            key.substring(key.length - 6, key.length);
          performanceChart.push({
            address: key,
            addressForDisplay: addressForDisplay,
            chart: chart,
            chainType: chainTypes[key],
          });
        }
      }

      // Sort the performanceChart array by chainType
      performanceChart.sort((a: any, b: any) =>
        a.chainType.localeCompare(b.chainType),
      );

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

    if (!result.items || result.items.length == 0) {
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

    await this.storageService.addData(address, result.items);

    await this.downloadAllForAddress(
      address,
      offset + this.fullDownloadsBatchSize,
    );
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

    var s = this.downloadService.downloadTransactions(
      address,
      0,
      this.initialNDownloads,
    );
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
      'Processing initial download(size = ' +
        this.initialNDownloads +
        ') for: ' +
        address,
    );

    var itemsz = result.items.length;
    var halfBoxId: string = '';

    if (itemsz > this.initialNDownloads / 2) {
      for (let i = Math.floor(itemsz / 2); i < itemsz; i++) {
        const item = result.items[i];

        for (let j = 0; j < item.inputs.length; j++) {
          if (item.inputs[j].boxId && halfBoxId == '') {
            halfBoxId = item.inputs[j].boxId;
          }
        }
      }
    }
    var boxId = await storageService.getDataByBoxId(halfBoxId, address);

    console.log('add bunch of data');
    await storageService.addData(address, result.items);

    if (boxId) {
      console.log(
        'Found existing boxId in db for download for: ' +
          address +
          ',no need to download more.',
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
              address.address.substring(
                address.address.length - 6,
                address.address.length,
              );
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
        if (
          !addresses.some((address) => address.address == input.outputAddress)
        ) {
          addresses.push({
            address: input.outputAddress,
            chainType: this.getChainType(input.address),
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
