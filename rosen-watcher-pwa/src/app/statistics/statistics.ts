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
  addresses: string[];
  noAddresses: boolean = false;
  showPermitsLink: boolean = false;
  addressesForDisplay: string[];

  constructor(private location: Location, private route: ActivatedRoute, private storageService: StorageService, private dataService: DataService, featureService: FeatureService, eventService: EventService) {

    super(eventService, featureService);
    this.data = "";
    this.addresses = [];
    this.addressesForDisplay = [];
    this.rewardsChart = [];
  }

  async retrieveData(): Promise<any[]> {
    this.data = await this.dataService.getTotalRewards();
    this.rewardsChart = await this.dataService.getRewardsChart();
    var result = await this.dataService.getInputs();
    this.addressesForDisplay = await this.dataService.getAddressesForDisplay();
    return result;
  }


  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    
    this.showPermitsLink = this.featureService.hasPermitScreen();

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      });

    this.route.params.subscribe(async params => {
      await this.checkAddressParams(params);

      var storageService = this.storageService;

      await this.retrieveData().then((inputs) => {
        this.addresses.forEach(async address => {
          await this.dataService.downloadForAddress(address, inputs, storageService);
          await this.retrieveData();
        });

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