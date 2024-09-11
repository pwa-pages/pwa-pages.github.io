import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EventService, EventType } from '../service/event.service';
import { StorageService } from '../service/storage.service';
import { SwipeService } from '../service/swipe.service';
import { DataService } from '../service/data.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ActivatedRoute, Params, RouterLink, RouterLinkActive } from '@angular/router';
import { Location, NgIf, NgStyle, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { QRDialogComponent } from './qrdialog.component';
import 'chartjs-adapter-date-fns';
import { ChartService, DateNumberPoint, LineChart } from '../service/chart.service';
import { Input } from '../models/input';
import { Address } from '../models/address';
//import { DownloadDataService } from '../service/download.data.service';
interface WindowWithPrompt extends Window {
  showHomeLink?: boolean;
  deferredPrompt?: BeforeInstallPromptEvent;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}
@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.html',
  standalone: true,
  imports: [NgIf, NgStyle, NgFor, RouterLink, RouterLinkActive],
})
export class StatisticsComponent extends BaseWatcherComponent implements OnInit {
  data: string;
  selectedTab: string;
  rewardsChart: DateNumberPoint[];
  sortedInputs: Input[];
  detailInputs: Input[];
  addresses: Address[];
  noAddresses = false;
  addressesForDisplay: Address[];
  shareSupport = false;
  chart: LineChart | undefined;

  @ViewChild('detailsContainer') detailsContainer!: ElementRef;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private dataService: DataService,
    //private downloadDataService: DownloadDataService,
    private chartService: ChartService,
    eventService: EventService<string>,
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
    this.detailInputs = [];
    
  }

  showHomeLink(): boolean {
    return (window as WindowWithPrompt).showHomeLink == true;
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  formatDate(utcDate: Date): string {
    const day = utcDate.getUTCDate().toString().padStart(2, '0');
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
    const month = monthNames[utcDate.getUTCMonth()];
    const year = utcDate.getUTCFullYear();

    return `${day} ${month} ${year}`;
  }

  async retrieveData(): Promise<void> {
    this.sortedInputs = await this.dataService.getSortedInputs();

    const newChart = this.sortedInputs.map((s) => {
      return { x: s.inputDate, y: s.accumulatedAmount } as DateNumberPoint;
    });
    this.sortedInputs.sort((a, b) => b.inputDate.getTime() - a.inputDate.getTime());

    this.detailInputs = this.sortedInputs.slice(0, 100);


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
    this.updateChart();
    this.data = await this.dataService.getTotalRewards(this.sortedInputs);
    this.addressesForDisplay = await this.dataService.getAddressesForDisplay(this.sortedInputs);
  }

  updateChart(): void {
    if (!this.chart) {
      this.chart = this.chartService.createStatisticsChart(this.rewardsChart);
    }
    this.chart.data.datasets[0].data = this.chartService.reduceChartData(this.rewardsChart, 15);
    this.chart.update();
  }

  installApp(): void {
    if ((window as WindowWithPrompt).deferredPrompt) {
      (window as WindowWithPrompt).deferredPrompt?.prompt();

      (window as WindowWithPrompt).deferredPrompt?.userChoice.then(
        (choiceResult: { outcome: 'accepted' | 'dismissed'; platform: string }) => {
          if (choiceResult.outcome === 'accepted') {
            (window as WindowWithPrompt).showHomeLink = false;
          }
          (window as WindowWithPrompt).deferredPrompt = undefined;
        },
      );
    }
  }

  showQR(): void {
    this.qrDialog.open(QRDialogComponent, {
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
    this.updateChart();
    this.route.queryParams.subscribe(async (params) => {
      await this.checkAddressParams(params);

      await this.retrieveData().then(async () => {
        this.eventService.sendEvent(EventType.StatisticsScreenLoaded);

        //await this.downloadDataService.downloadForAddresses();
      });
    });

    this.shareSupport = navigator.share != null && navigator.share != undefined;

    this.initSwipe('/performance', '/watchers');

    window.addEventListener('beforeinstallprompt', (event: Event) => {
      (window as WindowWithPrompt).showHomeLink = true;
      event.preventDefault();

      (window as WindowWithPrompt).deferredPrompt = event as BeforeInstallPromptEvent;
    });

    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
    });

    await this.subscribeToEvent(EventType.InputsStoredToDb, async () => {
      await this.retrieveData();
    });

    await this.subscribeToEvent(EventType.EndFullDownload, async () => {
      await this.retrieveData();
    });
  }

  title = 'rosen-watcher-pwa';

  private async checkAddressParams(params: Params): Promise<boolean> {
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

      await this.storageService.putAddressData(this.addresses);

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
