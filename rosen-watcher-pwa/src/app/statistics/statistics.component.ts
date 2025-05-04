import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EventData, EventService, EventType } from '../service/event.service';
import { StorageService } from '../service/storage.service';
import { DataService } from '../service/data.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, NgStyle, NgFor } from '@angular/common';
import 'chartjs-adapter-date-fns';
import { ChartService, LineChart } from '../service/chart.service';
import { Input } from '../../service/ts/models/input';
import { Address } from '../../service/ts/models/address';
import { ServiceWorkerService } from '../service/service.worker.service';
import { FormsModule } from '@angular/forms';
import { ChainService } from '../service/chain.service';
import { FilterDateComponent } from './filter.date.component';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { DateUtils } from './date.utils';
import { BrowserService } from '../service/browser.service';
import { CsvUtils } from './csv.utils';

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
    FilterDateComponent,
  ],
})
export class StatisticsComponent extends BaseWatcherComponent implements OnInit {
  DateUtils = DateUtils;
  totalRewards: string;
  selectedTab: string;
  rewardsChart: DateNumberPoint[];
  sortedInputs: Input[];
  detailInputs: Input[];
  window: HTMLElement = document.body;
  detailInputsSize = 100;

  version: string | null;

  selectedPeriod: Period | null;
  addressesForDisplay: Address[];
  shareSupport = false;
  chart: LineChart | undefined;

  @ViewChild('detailsContainer') detailsContainer!: ElementRef;
  filterDateActive = false;
  fromDate: Date | null = null;
  toDate: Date | null = null;

  constructor(
    private route: ActivatedRoute,
    chainService: ChainService,
    dataService: DataService,
    storageService: StorageService,
    private chartService: ChartService,
    eventService: EventService,
    browserService: BrowserService,
    private serviceWorkerService: ServiceWorkerService,
  ) {
    super(eventService, chainService, storageService, dataService, browserService);
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
    this.detailInputs = this.getDetailInputs(this.detailInputsSize);
  }

  getDetailInputs(size: number | null): Input[] {
    return this.dataService.getInputsPart(size, this.fromDate, this.toDate);
  }

  showHomeLink(): boolean {
    return this.browserService.showHomeLink();
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  async retrieveData(): Promise<void> {
    this.selectedPeriod = localStorage.getItem('statisticsPeriod') as Period;
    this.selectedPeriod = this.selectedPeriod == null ? Period.All : this.selectedPeriod;

    this.sortedInputs = DateUtils.filterByPeriod(
      this.dataService.getSortedInputs(true, null, null),
      this.selectedPeriod,
    );

    const amounts = this.sortedInputs.map((s) => {
      return { x: s.inputDate, y: s.amount } as DateNumberPoint;
    });

    this.detailInputs = this.getDetailInputs(this.detailInputsSize);

    this.setupRewardChart(amounts);
    this.updateChart();

    this.addressesForDisplay = await this.dataService.getAddressesForDisplay(
      this.dataService.rsnInputs,
    );
  }

  private setupRewardChart(amounts: DateNumberPoint[]) {
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

    if (this.rewardsChart.length > 0) {
      this.totalRewards = this.rewardsChart[this.rewardsChart.length - 1].y.toFixed(3).toString();
    }
  }

  filterDateClick() {
    this.filterDateActive = true;
  }

  onExportClick() {
    CsvUtils.csvExportInputs(this.getDetailInputs(null));
  }

  onDateRangeChanged(range: { from: Date | null; to: Date | null }) {
    this.fromDate = range.from;
    this.toDate = range.to;
    this.detailInputs = this.getDetailInputs(this.detailInputsSize);
    this.filterDateActive = false;
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

    this.chart.update();
  }

  installApp(): void {
    this.browserService.installApp();
  }

  onPeriodChange(): void {
    localStorage.setItem('statisticsPeriod', this.selectedPeriod as string);
    this.retrieveData();
  }

  showQR(): void {
    this.browserService.showQR(this.addresses);
  }

  share(): void {
    this.browserService.share(this.addresses);
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.selectedPeriod = localStorage.getItem('statisticsPeriod') as Period;
    this.updateChart();

    this.route.queryParams.subscribe(async (params) => {
      await this.checkProfileParams(params);
      await this.checkAddressParams(params);
      await this.eventService.sendEventWithData(
        EventType.StatisticsScreenLoaded,
        this.storageService.getProfile() as EventData,
      );
    });

    this.shareSupport = navigator.share != null && navigator.share != undefined;

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
