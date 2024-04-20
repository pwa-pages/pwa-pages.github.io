import { Component, OnInit} from '@angular/core';
import { EventService, EventType } from '../service/event.service';
import { StorageService } from '../service/storage.service';
import { DataService } from '../service/data.service';
import { FeatureService } from '../service/featureservice';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ActivatedRoute} from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'statistics',
  templateUrl: './statistics.html'
})


export class Statistics extends BaseWatcherComponent implements OnInit {

  data: string;
  rewardsChart: any[];
  readonly rewardsCardanoAddress: string = "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUskGdVdyYY5RBJnp3dfYC7iPoRNeopAFQWFwEbTieow347UhRyqvo2LntFpXzomvGwVTfq9YXS8Z1GGW5mUEioD5xC17Sz72NLbQrskSx7QZAxQTbMGh6vwM9J4q7NzRmQeHmWaHLpUHMU4Jdd5ccKumMvAY8d5C8RxB4iATySLY2N1wY84qNsWNaqkNofbUebf6LgmU9HTKAmU3nDoBfX7mhCjH8kXDhZeYdRsuLVFEYu83TkpwgHAYGmUoemxWAeA2BKMx8CBAy9jxbCyUjdnk9i7sLxuejrwLLh8W4tP81YkESjZ8BV65BhzPdvCaiX8vBSorgFfnvGKVzwfhhsSDwLY1GUwLTMLwTUTjSzEjsMX9hzsEEEmhxLsekabLmK3HZ1jssLrFryNuE59uS51hazJsi3gsT8SBk1J9YV6Dq6xto28nLqrMqK6raqLcAm2iU8hBtqdoSXqWzsrZHpqc2uLGhY52ee4k9TpFBvN1RovYUtY6KS4FncT4UgnbEFkzsnWYKX3CDn16tJs5CyZ97gKcvUonZ5EqTwabzni14CcQsTtKtEAqj1odvSyfJ94NnEjuiVPC3VmZbQvveN3bQ";
  readonly rewardsErgoAddress: string = "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUmvtxr3QSv1aLwThLXxeqYCCc34xjxZDPqPyNGYvWLNeBZxATvBeDuQ6pSiiRFknqmvYVsm9eH4Et3eRHCyxDJEoqZsAahwfVSya34dZNHmjaPQkwWo3Coc17pxiEnWuWmG38wSJz1awE6cymzhojnjxDTbbXgjR1yfYU3AU2v9zttnT8Gz3gUzZNSwjiXSPu3G9zkDaFZVKqb5QwTWY3Pp6SFJgBQfx3C3sp4a9d3n9c98pfWFWAGQN5EfkoHosF8BQTDuzXG3NU8gVCNeNPXYA8iWCbvY3XpxQMvQUxqkjDv9VQfUNvAKVHLW43chi2rdBrQ7Teu6NnesLRWUKXpzSxpByWftkCCdBppjZtYmhhCHqpQGkQyTcMRoP2krFKe7xKbfnFkdkhaYH9TTdKuTuKtGb265RXxiqrc34KvkZpaBBQB5UvoCU4iLSDngNTjqkNPnWekDahzNHLd6CtcdC1B19jdGEXWeNADemDtdK4zrMNg7U8iVpyGYhLDnkeLVrcbhoxkHxrFwfrN19XvitDosQqmt9dseR6SWHBCDZJdmJecCiEwd2wBiwN5N5umEy3Dd4Hznv7kDr6eX7KtYxp";
  addresses: string[];
  noAddresses: boolean = false;
  fullDownload: boolean = false;
  showPermitsLink: boolean = false;
  showAddToHomeScreen = false;
  
  addressesForDisplay: string[];
  readonly initialNDownloads: number = 50;
  readonly fullDownloadsBatchSize: number = 200;

  constructor(private location: Location, private route: ActivatedRoute, private storageService: StorageService, private dataService: DataService, private featureService: FeatureService, eventService: EventService) {

    super(eventService);
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


  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    
    this.showPermitsLink = this.featureService.hasPermitScreen();

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.showAddToHomeScreen = true;
    });

    this.route.params.subscribe(async params => {
      await this.checkAddressParams(params);

      var storageService = this.storageService;

      await this.retrieveData().then((inputs) => {
        this.fullDownload = true;
        this.addresses.forEach(async address => {
          await this.dataService.downloadForAddress(address, inputs, storageService);
          await this.retrieveData();
        });
        this.fullDownload = false;

      });
    });

    var me = this;
    this.subscribeToEvent(EventType.InputsStoredToDb,
      async function () {
        await me.retrieveData();
      }
    );

  }
  
  title = 'rosen-watcher-pwa';


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

      await this.storageService.clearInputsStore();
    }
    else {
      this.addresses = await this.dataService.getAddresses();
      if (this.addresses.length == 0) {
        this.noAddresses = true;
      }
    }
  }
}