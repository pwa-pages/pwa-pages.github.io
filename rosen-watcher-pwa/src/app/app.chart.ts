import { Component, OnInit } from '@angular/core';
import { DownloadService } from './download.service';
import { StorageService } from './storage.service';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-chart',
  templateUrl: './app.chart.html',
  styleUrl: './app.chart.css'
})


export class AppChart implements OnInit {

  data: string;
  rewardsChart: any[];
  readonly rewardsCardanoAddress: string = "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUskGdVdyYY5RBJnp3dfYC7iPoRNeopAFQWFwEbTieow347UhRyqvo2LntFpXzomvGwVTfq9YXS8Z1GGW5mUEioD5xC17Sz72NLbQrskSx7QZAxQTbMGh6vwM9J4q7NzRmQeHmWaHLpUHMU4Jdd5ccKumMvAY8d5C8RxB4iATySLY2N1wY84qNsWNaqkNofbUebf6LgmU9HTKAmU3nDoBfX7mhCjH8kXDhZeYdRsuLVFEYu83TkpwgHAYGmUoemxWAeA2BKMx8CBAy9jxbCyUjdnk9i7sLxuejrwLLh8W4tP81YkESjZ8BV65BhzPdvCaiX8vBSorgFfnvGKVzwfhhsSDwLY1GUwLTMLwTUTjSzEjsMX9hzsEEEmhxLsekabLmK3HZ1jssLrFryNuE59uS51hazJsi3gsT8SBk1J9YV6Dq6xto28nLqrMqK6raqLcAm2iU8hBtqdoSXqWzsrZHpqc2uLGhY52ee4k9TpFBvN1RovYUtY6KS4FncT4UgnbEFkzsnWYKX3CDn16tJs5CyZ97gKcvUonZ5EqTwabzni14CcQsTtKtEAqj1odvSyfJ94NnEjuiVPC3VmZbQvveN3bQ";
  readonly rewardsErgoAddress: string = "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUmvtxr3QSv1aLwThLXxeqYCCc34xjxZDPqPyNGYvWLNeBZxATvBeDuQ6pSiiRFknqmvYVsm9eH4Et3eRHCyxDJEoqZsAahwfVSya34dZNHmjaPQkwWo3Coc17pxiEnWuWmG38wSJz1awE6cymzhojnjxDTbbXgjR1yfYU3AU2v9zttnT8Gz3gUzZNSwjiXSPu3G9zkDaFZVKqb5QwTWY3Pp6SFJgBQfx3C3sp4a9d3n9c98pfWFWAGQN5EfkoHosF8BQTDuzXG3NU8gVCNeNPXYA8iWCbvY3XpxQMvQUxqkjDv9VQfUNvAKVHLW43chi2rdBrQ7Teu6NnesLRWUKXpzSxpByWftkCCdBppjZtYmhhCHqpQGkQyTcMRoP2krFKe7xKbfnFkdkhaYH9TTdKuTuKtGb265RXxiqrc34KvkZpaBBQB5UvoCU4iLSDngNTjqkNPnWekDahzNHLd6CtcdC1B19jdGEXWeNADemDtdK4zrMNg7U8iVpyGYhLDnkeLVrcbhoxkHxrFwfrN19XvitDosQqmt9dseR6SWHBCDZJdmJecCiEwd2wBiwN5N5umEy3Dd4Hznv7kDr6eX7KtYxp";
  addresses: string[];
  noAddresses: boolean = false;
  showAddToHomeScreen = false;
  addressesForDisplay: string[];
  readonly initialNDownloads: number = 50;
  readonly fullDownloadsBatchSize: number = 200;

  constructor(private location: Location, private route: ActivatedRoute, private downloadService: DownloadService, private storageService: StorageService, private dataService: DataService) {

    this.data = "";
    this.addresses = [];
    this.addressesForDisplay = [];
    this.rewardsChart = [];

  }

  async retrieveData(): Promise<any[]> {
    await this.dataService.getTotalRewards().then(t => { this.data = t; });
    await this.dataService.getRewardsChart().then(r => this.rewardsChart = r);
    var result = await this.dataService.getInputs();
    this.addressesForDisplay = await this.dataService.getAddressesForDisplay();
    return result;
  }

  async ngOnInit(): Promise<void> {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.showAddToHomeScreen = true;
    });

    this.route.params.subscribe(async params => {
      await this.checkAddressParams(params);

      var storageService = this.storageService;

      await this.retrieveData().then((inputs) => {
        this.addresses.forEach(address => {
          this.downloadForAddress(address, inputs, storageService);
        });
      });
    });


  }

  title = 'rosen-watcher-pwa';

  private downloadAllForAddress(address: string, offset: number) {
    var s = this.downloadService.downloadTransactions(address, offset, this.fullDownloadsBatchSize+10);

    s.subscribe(async (result) => {

      console.log('Processing all download(offset = ' + offset + ', size = ' + this.fullDownloadsBatchSize + ') for: ' + address);

      if (!result.items || result.items.length == 0) {
        return;
      }

      if (offset > 10000) {
        console.log('this gets out of hand');
      }

      result.items.forEach((item: any) => {
        item.inputs.forEach(async (input: any) => {
          await this.storageService.addData(address, item, input);
        });
      });
      await this.retrieveData();
      this.downloadAllForAddress(address, offset + this.fullDownloadsBatchSize);

    });

  }

  private downloadForAddress(address: string, inputs: any[], storageService: StorageService) {
    var s = this.downloadService.downloadTransactions(address, 0, this.initialNDownloads);

    s.subscribe(async (result) => {

      console.log('Processing initial download(size = ' + this.initialNDownloads + ') for: ' + address);

      var itemsz = result.items.length;
      var halfBoxId: string = "";


      if (itemsz > this.initialNDownloads / 2) {
        for (let i = itemsz / 2; i < itemsz; i++) {
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

      await this.retrieveData();

      if (boxId) {
        console.log('Found existing boxId in db for download for: ' + address + ',no need to download more.');
      }
      if (!boxId) {
        console.log('Downloading all tx\'s for : ' + address);
        await this.downloadAllForAddress(address, 0);
      }
    });
  }

  private async checkAddressParams(params: any) {
    if (params['addresses']) {

      const addressesParam = params['addresses'];
      console.log(addressesParam);

      this.addresses = JSON.parse(decodeURIComponent(addressesParam));
      let currentPath = this.location.path();

      if (currentPath.includes(';')) {
        let parts = currentPath.split(';');
        let newPath = parts[0];
        this.location.replaceState(newPath);
      }

      await this.storageService.clearDB();
    }
    else {
      this.addresses = await this.dataService.getAddresses();
      if (this.addresses.length == 0) {
        this.noAddresses = true;
      }
    }
  }
}