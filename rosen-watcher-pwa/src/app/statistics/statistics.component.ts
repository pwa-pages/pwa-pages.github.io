import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EventData, EventService, EventType } from '../service/event.service';
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
import { ChartService, LineChart } from '../service/chart.service';
import { Input } from '../../service/ts/models/input';
import { Address } from '../../service/ts/models/address';
import { ServiceWorkerService } from '../service/service.worker.service';
import { FormsModule } from '@angular/forms';

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
  imports: [NgIf, NgStyle, NgFor, RouterLink, RouterLinkActive, FormsModule],
})
export class StatisticsComponent extends BaseWatcherComponent implements OnInit {
  totalRewards: string;
  selectedTab: string;
  rewardsChart: DateNumberPoint[];
  sortedInputs: Input[];
  detailInputs: Input[];
  addresses: Address[];
  version: string | null;
  noAddresses = false;
  selectedPeriod: Period | null;
  addressesForDisplay: Address[];
  shareSupport = false;
  chart: LineChart | undefined;

  @ViewChild('detailsContainer') detailsContainer!: ElementRef;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private dataService: DataService,
    private chartService: ChartService,
    eventService: EventService,
    swipeService: SwipeService,
    private serviceWorkerService: ServiceWorkerService,
    private router: Router,
    private qrDialog: MatDialog,
  ) {
    super(eventService, swipeService);
    this.totalRewards = '';
    this.selectedTab = 'chart';
    this.addresses = [];
    this.addressesForDisplay = [];
    this.rewardsChart = [];
    this.sortedInputs = [];
    this.detailInputs = [];
    this.version = '';
    this.selectedPeriod = null;
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

  private reduceData(inputs: Input[], period: Period): Input[] {
    const date = new Date();

    switch (period) {
      case Period.Day:
        date.setDate(date.getDate() - 1);
        break;
      case Period.Week:
        date.setDate(date.getDate() - 7);
        break;
      case Period.Month:
        date.setMonth(date.getMonth() - 1);
        break;
      case Period.Year:
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setFullYear(date.getFullYear() - 100);
    }

    inputs = inputs.filter((r) => r.inputDate >= date);

    return inputs;
  }

  async retrieveData(): Promise<void> {
    this.selectedPeriod = localStorage.getItem('statisticsPeriod') as Period;
    this.selectedPeriod = this.selectedPeriod == null ? Period.All : this.selectedPeriod;

    this.sortedInputs = this.reduceData(this.dataService.getSortedInputs(), this.selectedPeriod);

    const amounts = this.sortedInputs.map((s) => {
      return { x: s.inputDate, y: s.amount } as DateNumberPoint;
    });
    this.sortedInputs.sort((a, b) => b.inputDate.getTime() - a.inputDate.getTime());

    this.detailInputs = this.sortedInputs.slice(0, 100);

    if (this.rewardsChart.length != 0 && amounts.length != this.rewardsChart.length && this.chart) {
      this.chart.options.animation = {
        duration: 1000,
      };
    }

    let accumulatedAmount = 0;
    this.rewardsChart = amounts.map((s) => {
      accumulatedAmount += s.y;
      return { x: s.x, y: accumulatedAmount } as DateNumberPoint;
    });

    this.updateChart();

    if (this.rewardsChart.length > 0) {
      this.totalRewards = this.rewardsChart[this.rewardsChart.length - 1].y.toFixed(3).toString();
    }

    this.addressesForDisplay = await this.dataService.getAddressesForDisplay(this.sortedInputs);
  }

  updateChart(): void {
    if (!this.chart) {
      this.chart = this.chartService.createStatisticsChart(this.rewardsChart, 1, [0.4]);
    }

    this.chart.data.datasets[0].data = this.chartService.reduceChartData(
      this.rewardsChart,
      20,
      true,
    );

    /*
    this.chart.data.datasets[1].data = this.chartService.reduceChartData(
      this.rewardsChart,
      20,
      true,
    );
    */

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

  onPeriodChange(): void {
    localStorage.setItem('statisticsPeriod', this.selectedPeriod as string);
    this.retrieveData();
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

    this.selectedPeriod = localStorage.getItem('statisticsPeriod') as Period;
    this.updateChart();
    this.route.queryParams.subscribe(async (params) => {
      await this.checkAddressParams(params);

      this.eventService.sendEventWithData(
        EventType.StatisticsScreenLoaded,
        this.selectedPeriod as EventData,
      );
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

    await this.subscribeToEvent<Input[]>(EventType.RefreshInputs, async () => {
      await this.retrieveData();
    });

    this.version = this.serviceWorkerService.getVersion();
    await this.subscribeToEvent<string>(EventType.VersionUpdated, async (v) => {
      this.version = v;
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
