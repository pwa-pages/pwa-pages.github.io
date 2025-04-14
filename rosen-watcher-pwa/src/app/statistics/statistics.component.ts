import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EventData, EventService, EventType } from '../service/event.service';
import { StorageService } from '../service/storage.service';
import { DataService } from '../service/data.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
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
import { ChainService } from '../service/chain.service';
import { NavigationService } from '../service/navigation.service';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

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
  imports: [
    NgIf,
    NgStyle,
    NgFor,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    InfiniteScrollDirective,
  ],
})
export class StatisticsComponent extends BaseWatcherComponent implements OnInit {
  totalRewards: string;
  selectedTab: string;
  rewardsChart: DateNumberPoint[];
  sortedInputs: Input[];
  detailInputs: Input[];
  window: any = document.body;
  detailInputsSize = 100;

  version: string | null;

  selectedPeriod: Period | null;
  addressesForDisplay: Address[];
  shareSupport = false;
  chart: LineChart | undefined;

  @ViewChild('detailsContainer') detailsContainer!: ElementRef;

  constructor(
    location: Location,
    private route: ActivatedRoute,
    chainService: ChainService,
    dataService: DataService,
    storageService: StorageService,
    private chartService: ChartService,
    eventService: EventService,
    private serviceWorkerService: ServiceWorkerService,
    private router: Router,
    private qrDialog: MatDialog,
    navigationService: NavigationService,
  ) {
    super(eventService, navigationService, chainService, storageService, dataService, location);
    this.totalRewards = '';
    this.selectedTab = 'chart';
    this.addressesForDisplay = [];
    this.rewardsChart = [];
    this.sortedInputs = [];
    this.detailInputs = [];
    this.version = '';
    this.selectedPeriod = null;
  }

  loadMoreInputs() {
    this.detailInputsSize += 100;
    this.detailInputs = this.dataService.getSortedInputs(false).slice(0, this.detailInputsSize);
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

  formatTime(utcDate: Date): string {
    const hours = utcDate.getUTCHours().toString().padStart(2, '0');
    const minutes = utcDate.getUTCMinutes().toString().padStart(2, '0');
    const seconds = utcDate.getUTCSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
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

    this.sortedInputs = this.reduceData(
      this.dataService.getSortedInputs(true),
      this.selectedPeriod,
    );

    const amounts = this.sortedInputs.map((s) => {
      return { x: s.inputDate, y: s.amount } as DateNumberPoint;
    });

    this.detailInputs = this.dataService.getSortedInputs(false).slice(0, this.detailInputsSize);

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

    this.addressesForDisplay = await this.dataService.getAddressesForDisplay(
      this.dataService.getSortedInputs(false),
    );
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
      await this.checkProfileParams(params);
      //const hasAddressParams =
      await this.checkAddressParams(params);
      /*
      if (!hasAddressParams) {
        this.eventService.sendEventWithData(
          EventType.RequestInputsDownload,
          this.storageService.getProfile() as EventData,
        );
      }
        */
      this.eventService.sendEventWithData(
        EventType.StatisticsScreenLoaded,
        this.storageService.getProfile() as EventData,
      );
    });

    this.shareSupport = navigator.share != null && navigator.share != undefined;

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
}
