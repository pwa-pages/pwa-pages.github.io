import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EventService, EventType } from '../service/event.service';
import { StorageService } from '../service/storage.service';
import { SwipeService } from '../service/swipe.service';
import { DataService } from '../service/data.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { Location, NgIf, NgStyle, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { QRDialog } from './qrdialog';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { ChartService } from '../service/chart.service';

@Component({
  selector: 'statistics',
  templateUrl: './statistics.html',
  standalone: true,
  imports: [NgIf, NgStyle, NgFor, RouterLink, RouterLinkActive],
})
export class Statistics extends BaseWatcherComponent implements OnInit {
  data: string;
  selectedTab: string;
  rewardsChart: any[];
  sortedInputs: any[];
  addresses: any[];
  noAddresses = false;
  addressesForDisplay: any[];
  shareSupport = false;
  chart: Chart<'line', any[][], unknown> | undefined;
  @ViewChild('detailsContainer') detailsContainer!: ElementRef;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private dataService: DataService,
    private chartService: ChartService,
    eventService: EventService,
    swipeService: SwipeService,
    private router: Router,
    private qrDialog: MatDialog,
  ) {
    super(eventService, swipeService);
    this.data = '';
    this.selectedTab = 'chart';
    this.addresses = [];
    this.addressesForDisplay = [];
    this.rewardsChart = [];
    this.sortedInputs = [];
  }

  showHomeLink(): boolean {
    return (window as any).showHomeLink;
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  formatDate(utcDate: any): string {
    const date = new Date(utcDate);

    const day = date.getUTCDate().toString().padStart(2, '0');
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    return `${day} ${month} ${year}`;
  }

  async retrieveData(): Promise<any[]> {
    this.data = await this.dataService.getTotalRewards();

    this.sortedInputs = await this.dataService.getSortedInputs();

    const newChart = this.sortedInputs.map((s) => {
      return { x: s.inputDate, y: s.accumulatedAmount };
    });
    this.sortedInputs.sort((a, b) => b.inputDate - a.inputDate);

    if (
      this.rewardsChart.length != 0 &&
      newChart.length != this.rewardsChart.length &&
      this.chart
    ) {
      this.chart.options.animation = {
        duration: 1000,
      };
    }

    this.rewardsChart = newChart;
    const result = await this.dataService.getInputs();
    this.addressesForDisplay = await this.dataService.getAddressesForDisplay();

    this.updateChart();
    return result;
  }

  updateChart(): void {
    if (!this.chart) {
      this.chart = this.chartService.createStatisticsChart(this.rewardsChart);
    }
    this.chart.data.datasets[0].data = this.chartService.reduceChartData(this.rewardsChart, 15);
    this.chart.update();
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

  showQR(): void {
    this.qrDialog.open(QRDialog, {
      data: { qrData: this.getShareUrl() },
    });
  }

  getShareUrl(): string {
    const currentUrl = window.location.pathname;
    const subdirectory = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
    const urlTree = this.router.createUrlTree(['main'], {
      queryParams: { addresses: JSON.stringify(this.addresses) },
    });
    const url = window.location.origin + subdirectory + this.router.serializeUrl(urlTree);
    return url;
  }

  share(): void {
    const url = this.getShareUrl();

    console.log('share url: ' + url);

    navigator.share({
      title: 'Rosen Watcher',
      text: 'Rosen Watcher',
      url: url,
    });
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.shareSupport = navigator.share != null && navigator.share != undefined;

    var me = this;
    this.initSwipe('/performance', '/watchers');

    window.addEventListener('beforeinstallprompt', (event) => {
      (window as any).showHomeLink = true;
      event.preventDefault();

      (window as any).deferredPrompt = event;
    });

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
    });

    this.route.queryParams.subscribe(async (params) => {
      const hasAddressParams = await this.checkAddressParams(params);

      const storageService = this.storageService;

      await this.retrieveData().then(() => {
        this.addresses.forEach(async (address) => {
          await this.dataService.downloadForAddress(
            address.address,
            storageService,
            hasAddressParams,
          );
          await this.retrieveData();
        });
      });
    });

    var me = this;
    await this.subscribeToEvent(EventType.InputsStoredToDb, async function () {
      await me.retrieveData();
    });

    await this.subscribeToEvent(EventType.EndFullDownload, async function () {
      await me.retrieveData();
    });
  }

  title = 'rosen-watcher-pwa';

  private async checkAddressParams(params: any): Promise<boolean> {
    if (params['addresses']) {
      const addressesParam = params['addresses'];
      console.log(addressesParam);

      this.addresses = JSON.parse(decodeURIComponent(addressesParam));
      const currentPath = this.location.path();

      if (currentPath.includes('?')) {
        const parts = currentPath.split('?');
        const newPath = parts[0];
        this.location.replaceState(newPath);
      }

      await this.storageService.clearInputsStore();
      if (this.addresses.length == 0) {
        this.noAddresses = true;
      }
      return true;
    } else {
      this.addresses = await this.dataService.getAddresses();
      if (this.addresses.length == 0) {
        this.noAddresses = true;
      }
      return false;
    }
  }
}
