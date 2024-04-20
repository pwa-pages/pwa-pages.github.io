import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DownloadService } from './download.service';
import { EventService, EventType } from './event.service';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  readonly rewardsCardanoAddress: string = "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUskGdVdyYY5RBJnp3dfYC7iPoRNeopAFQWFwEbTieow347UhRyqvo2LntFpXzomvGwVTfq9YXS8Z1GGW5mUEioD5xC17Sz72NLbQrskSx7QZAxQTbMGh6vwM9J4q7NzRmQeHmWaHLpUHMU4Jdd5ccKumMvAY8d5C8RxB4iATySLY2N1wY84qNsWNaqkNofbUebf6LgmU9HTKAmU3nDoBfX7mhCjH8kXDhZeYdRsuLVFEYu83TkpwgHAYGmUoemxWAeA2BKMx8CBAy9jxbCyUjdnk9i7sLxuejrwLLh8W4tP81YkESjZ8BV65BhzPdvCaiX8vBSorgFfnvGKVzwfhhsSDwLY1GUwLTMLwTUTjSzEjsMX9hzsEEEmhxLsekabLmK3HZ1jssLrFryNuE59uS51hazJsi3gsT8SBk1J9YV6Dq6xto28nLqrMqK6raqLcAm2iU8hBtqdoSXqWzsrZHpqc2uLGhY52ee4k9TpFBvN1RovYUtY6KS4FncT4UgnbEFkzsnWYKX3CDn16tJs5CyZ97gKcvUonZ5EqTwabzni14CcQsTtKtEAqj1odvSyfJ94NnEjuiVPC3VmZbQvveN3bQ";
  readonly rewardsErgoAddress: string = "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUmvtxr3QSv1aLwThLXxeqYCCc34xjxZDPqPyNGYvWLNeBZxATvBeDuQ6pSiiRFknqmvYVsm9eH4Et3eRHCyxDJEoqZsAahwfVSya34dZNHmjaPQkwWo3Coc17pxiEnWuWmG38wSJz1awE6cymzhojnjxDTbbXgjR1yfYU3AU2v9zttnT8Gz3gUzZNSwjiXSPu3G9zkDaFZVKqb5QwTWY3Pp6SFJgBQfx3C3sp4a9d3n9c98pfWFWAGQN5EfkoHosF8BQTDuzXG3NU8gVCNeNPXYA8iWCbvY3XpxQMvQUxqkjDv9VQfUNvAKVHLW43chi2rdBrQ7Teu6NnesLRWUKXpzSxpByWftkCCdBppjZtYmhhCHqpQGkQyTcMRoP2krFKe7xKbfnFkdkhaYH9TTdKuTuKtGb265RXxiqrc34KvkZpaBBQB5UvoCU4iLSDngNTjqkNPnWekDahzNHLd6CtcdC1B19jdGEXWeNADemDtdK4zrMNg7U8iVpyGYhLDnkeLVrcbhoxkHxrFwfrN19XvitDosQqmt9dseR6SWHBCDZJdmJecCiEwd2wBiwN5N5umEy3Dd4Hznv7kDr6eX7KtYxp";
  readonly initialNDownloads: number = 50;
  readonly fullDownloadsBatchSize: number = 200;
  busyCounter: number = 0;

  constructor(private storageService: StorageService, private downloadService: DownloadService, private eventService: EventService) { }

  async getWatcherInputs(): Promise<any[]> {
    
    

    var inputsPromise = this.storageService.getInputs();

    try {

      const inputs = await inputsPromise;

      var result_1 = inputs.filter((i: any) => i.address === this.rewardsCardanoAddress || i.address === this.rewardsErgoAddress)
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
      return "";
    }
  }

  async getRewardsChart(): Promise<any[]> {
    var inputsPromise = this.getWatcherInputs();
    var amount = 0;
    var rewardsChart: any = [
    ];
    console.log('start retrieving chart from database');
    try {
      const inputs = await inputsPromise;

      inputs.sort((a, b) => a.inputDate - b.inputDate);

      inputs.forEach((input: any) => {
        input.assets.forEach((asset: any) => {
          amount += asset.amount;
          rewardsChart.push({ x: input.inputDate, y: amount })

        })
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

  async getAddressesForDisplay(): Promise<string[]> {
    var addresses = this.getAddresses();

    return addresses.then(adresses => {
      var result: string[] = [];
      adresses.forEach((a: string) => {

        result.push(a.substring(0, 6) + '...' + a.substring(a.length - 6, a.length));

      });

      return result;

    });
  }

  private IncreaseBusyCounter(): void {
    if (this.busyCounter == 0) {
      this.eventService.sendEvent(EventType.StartDownload);
    }
    this.busyCounter++;
  }

  private DecreasBusyCounter(): void {
    this.busyCounter--;
    if (this.busyCounter == 0) {
      this.eventService.sendEvent(EventType.EndDownload);
    }
  }


  private async downloadAllForAddress(address: string, offset: number) {
    this.IncreaseBusyCounter();
    console.log(this.busyCounter);
    var s = this.downloadService.downloadTransactions(address, offset, this.fullDownloadsBatchSize + 10);
    var result = await firstValueFrom(s);

    console.log('Processing all download(offset = ' + offset + ', size = ' + this.fullDownloadsBatchSize + ') for: ' + address);

    if (!result.items || result.items.length == 0) {
      this.DecreasBusyCounter();
      console.log(this.busyCounter)
      return;
    }

    if (offset > 10000) {
      this.DecreasBusyCounter();
      console.log(this.busyCounter)
      console.log('this gets out of hand');
      return;
    }

    result.items.forEach((item: any) => {
      item.inputs.forEach(async (input: any) => {
        await this.storageService.addData(address, item, input);
      });
    });

    await this.downloadAllForAddress(address, offset + this.fullDownloadsBatchSize);
    this.DecreasBusyCounter();
    console.log(this.busyCounter);
  }

  public async downloadForAddress(address: string, inputs: any[], storageService: StorageService) {
    this.IncreaseBusyCounter();
    console.log(this.busyCounter);

    var s = this.downloadService.downloadTransactions(address, 0, this.initialNDownloads);
    var result = await firstValueFrom(s.pipe(catchError(e => { this.DecreasBusyCounter(); throw e; })));

    console.log('Processing initial download(size = ' + this.initialNDownloads + ') for: ' + address);

    var itemsz = result.items.length;
    var halfBoxId: string = "";

    if (itemsz > this.initialNDownloads / 2) {
      for (let i = Math.floor(itemsz / 2); i < itemsz; i++) {
        const item = result.items[i];

        for (let j = 0; j < item.inputs.length; j++) {
          if (item.inputs[j].boxId && halfBoxId == "") {
            halfBoxId = item.inputs[j].boxId;
          }
        }
      }
    }
    var boxId = await storageService.getDataByBoxId(halfBoxId);

    result.items.forEach((item: any) => {
      item.inputs.forEach(async (input: any) => {
        await storageService.addData(address, item, input);
      });
    });

    await this.eventService.sendEvent(EventType.InputsStoredToDb);

    if (boxId) {
      console.log('Found existing boxId in db for download for: ' + address + ',no need to download more.');
    }
    if (!boxId) {
      console.log('Downloading all tx\'s for : ' + address);

      await this.downloadAllForAddress(address, 0);
      await this.eventService.sendEvent(EventType.InputsStoredToDb);
    }

    this.DecreasBusyCounter();
    console.log(this.busyCounter)
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
            address.addressForDisplay = address.address.substring(0, 6) + ' ... ' + address.address.substring(address.address.length - 6, address.address.length);
          }
          else {
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

  async getAddresses(): Promise<string[]> {
    var inputsPromise = this.getWatcherInputs();
    var addresses: string[] = [];

    try {
      const inputs = await inputsPromise;

      inputs.forEach((input: any) => {

        if (addresses.indexOf(input.outputAddress) === -1) {
          addresses.push(input.outputAddress);
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