// src/app/data.service.ts
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  readonly rewardsCardanoAddress: string = "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUskGdVdyYY5RBJnp3dfYC7iPoRNeopAFQWFwEbTieow347UhRyqvo2LntFpXzomvGwVTfq9YXS8Z1GGW5mUEioD5xC17Sz72NLbQrskSx7QZAxQTbMGh6vwM9J4q7NzRmQeHmWaHLpUHMU4Jdd5ccKumMvAY8d5C8RxB4iATySLY2N1wY84qNsWNaqkNofbUebf6LgmU9HTKAmU3nDoBfX7mhCjH8kXDhZeYdRsuLVFEYu83TkpwgHAYGmUoemxWAeA2BKMx8CBAy9jxbCyUjdnk9i7sLxuejrwLLh8W4tP81YkESjZ8BV65BhzPdvCaiX8vBSorgFfnvGKVzwfhhsSDwLY1GUwLTMLwTUTjSzEjsMX9hzsEEEmhxLsekabLmK3HZ1jssLrFryNuE59uS51hazJsi3gsT8SBk1J9YV6Dq6xto28nLqrMqK6raqLcAm2iU8hBtqdoSXqWzsrZHpqc2uLGhY52ee4k9TpFBvN1RovYUtY6KS4FncT4UgnbEFkzsnWYKX3CDn16tJs5CyZ97gKcvUonZ5EqTwabzni14CcQsTtKtEAqj1odvSyfJ94NnEjuiVPC3VmZbQvveN3bQ";
  readonly rewardsErgoAddress: string = "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUmvtxr3QSv1aLwThLXxeqYCCc34xjxZDPqPyNGYvWLNeBZxATvBeDuQ6pSiiRFknqmvYVsm9eH4Et3eRHCyxDJEoqZsAahwfVSya34dZNHmjaPQkwWo3Coc17pxiEnWuWmG38wSJz1awE6cymzhojnjxDTbbXgjR1yfYU3AU2v9zttnT8Gz3gUzZNSwjiXSPu3G9zkDaFZVKqb5QwTWY3Pp6SFJgBQfx3C3sp4a9d3n9c98pfWFWAGQN5EfkoHosF8BQTDuzXG3NU8gVCNeNPXYA8iWCbvY3XpxQMvQUxqkjDv9VQfUNvAKVHLW43chi2rdBrQ7Teu6NnesLRWUKXpzSxpByWftkCCdBppjZtYmhhCHqpQGkQyTcMRoP2krFKe7xKbfnFkdkhaYH9TTdKuTuKtGb265RXxiqrc34KvkZpaBBQB5UvoCU4iLSDngNTjqkNPnWekDahzNHLd6CtcdC1B19jdGEXWeNADemDtdK4zrMNg7U8iVpyGYhLDnkeLVrcbhoxkHxrFwfrN19XvitDosQqmt9dseR6SWHBCDZJdmJecCiEwd2wBiwN5N5umEy3Dd4Hznv7kDr6eX7KtYxp";


  constructor(private storageService: StorageService) { }

  async getInputs(): Promise<any[]> {
    var inputsPromise = this.storageService.getData();

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

  async getTotalRewards(): Promise<string> {
    var inputsPromise = this.getInputs();

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
    var inputsPromise = this.getInputs();
    var amount = 0;
    var rewardsChart: any = [
    ];

    try {
      const inputs = await inputsPromise;

      inputs.sort((a, b) => a.inputDate - b.inputDate);

      inputs.forEach((input: any) => {
        input.assets.forEach((asset: any) => {
          amount += asset.amount;
          rewardsChart.push({ x: input.inputDate, y: amount })

        })
      });

      return await new Promise<string[]>((resolve, reject) => {
        resolve(rewardsChart);
      });
    } catch (error) {
      console.error(error);
      return rewardsChart;
    }
  }

  async getAddresses(): Promise<string[]> {
    var inputsPromise = this.getInputs();
    var addresses: string[] = [];

    try {
      const inputs = await inputsPromise;

      inputs.forEach((input: any) => {

        if(addresses.indexOf(input.outputAddress) === -1){
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

