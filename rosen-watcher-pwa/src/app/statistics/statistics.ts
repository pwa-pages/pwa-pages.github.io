import { Component, OnInit } from '@angular/core';
import { EventService, EventType } from '../service/event.service';
import { StorageService } from '../service/storage.service';
import { SwipeService } from '../service/swipe.service';
import { DataService } from '../service/data.service';
import { FeatureService } from '../service/featureservice';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { QRDialog } from './qrdialog'

@Component({
  selector: 'statistics',
  templateUrl: './statistics.html'
})


export class Statistics extends BaseWatcherComponent implements OnInit {

  data: string;
  rewardsChart: any[];
  addresses: any[];
  noAddresses: boolean = false;
  showPermitsLink: boolean = false;
  addressesForDisplay: any[];
  shareSupport: boolean = false;
  loaderLogs: string[] = [];

  constructor(private location: Location, private route: ActivatedRoute,   private storageService: StorageService, private dataService: DataService, featureService: FeatureService, eventService: EventService, swipeService: SwipeService, private router: Router, private qrDialog: MatDialog) {

    super(eventService, featureService, swipeService);
    this.data = "";
    this.addresses = [];
    this.addressesForDisplay = [];
    this.rewardsChart = [];
  }

  showHomeLink(): boolean {
    return (window as any).showHomeLink;
  }

  async retrieveData(): Promise<any[]> {
    this.data = await this.dataService.getTotalRewards();
    this.rewardsChart = await this.dataService.getRewardsChart();
    var result = await this.dataService.getInputs();
    this.addressesForDisplay = await this.dataService.getAddressesForDisplay();
    return result;
  }
  installApp(): void {
    if ((window as any).deferredPrompt) {
      (window as any).deferredPrompt.prompt();

      (window as any).deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          (window as any).showHomeLink = false;
        } else {
        }
        (window as any).deferredPrompt = null;
      });
    }
  }

  swipeLeft(): void {
    
    this.swipeService.swipe('left', '/performance');
  }

  showQR(): void{
    this.qrDialog.open(QRDialog, {
      data: { qrData: this.getShareUrl() }
    });
  }

  getShareUrl(): string{
    const currentUrl = window.location.pathname;
    const subdirectory = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
    const urlTree = this.router.createUrlTree(['main'], {
      queryParams: { addresses: JSON.stringify(this.addresses) }
    });
    var  url = window.location.origin + subdirectory + this.router.serializeUrl(urlTree);
    return url;
  }

  share(): void {
    var url = this.getShareUrl();
    
    console.log('share url: ' + url);

    navigator.share({
      title: 'Rosen Watcher',
      text: 'Rosen Watcher',
      url: url
    });

    
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.shareSupport = (navigator.share != null && navigator.share != undefined );
    
    var me = this;
    this.swipeService.swipeDetect('/performance');


    window.addEventListener('beforeinstallprompt', (event) => {
      (window as any).showHomeLink = true;
      event.preventDefault();

      (window as any).deferredPrompt = event;

    });

    this.showPermitsLink = this.featureService.hasPermitScreen();

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
    });

    this.route.queryParams.subscribe(async params => {
      
      
      var hasAddressParams = await this.checkAddressParams(params);

      var storageService = this.storageService;

      await this.retrieveData().then((inputs) => {
        this.addresses.forEach(async address => {
          await this.dataService.downloadForAddress(address.address, inputs, storageService, hasAddressParams);
          await this.retrieveData();
        });

      });
    });

    var me = this;
    await this.subscribeToEvent(EventType.InputsStoredToDb,
      async function () {
        await me.retrieveData();
      }
    );

    await this.subscribeToEvent(EventType.StartDownload,
      async function (url) {
        
        me.loaderLogs.push('Downloading ' + me.getScreenLogurl(url));
        me.loaderLogs = me.loaderLogs.slice(-5);
        
        
      }
    );



    await this.subscribeToEvent(EventType.EndFullDownload,
      async function () {
        await me.retrieveData();
        me.loaderLogs = [];
      }
    );


  }

  private getScreenLogurl(url: string): string{
    return url.substring(0, 10) + ' ... ' + url.slice(-40);
  }

  title = 'rosen-watcher-pwa';


  private async checkAddressParams(params: any): Promise<boolean> {
    if (params['addresses']) {

      const addressesParam = params['addresses'];
      console.log(addressesParam);

      this.addresses = JSON.parse(decodeURIComponent(addressesParam));
      let currentPath = this.location.path();

      if (currentPath.includes('?')) {
        let parts = currentPath.split('?');
        let newPath = parts[0];
        this.location.replaceState(newPath);
      }

      await this.storageService.clearInputsStore();
      return true;
    }
    else {
      this.addresses = await this.dataService.getAddresses();
      if (this.addresses.length == 0) {
        this.noAddresses = true;
      }
      return false;
    }
  }
}