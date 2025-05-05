import { Component, OnInit, ViewChild, ElementRef, Injector } from '@angular/core';
import { EventData, EventType } from '../service/event.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, NgStyle, NgFor } from '@angular/common';
import 'chartjs-adapter-date-fns';
import { Input } from '../../service/ts/models/input';
import { Address } from '../../service/ts/models/address';
import { ServiceWorkerService } from '../service/service.worker.service';
import { FormsModule } from '@angular/forms';
import { FilterDateComponent } from './filter.date.component';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { DateUtils } from './date.utils';
import { CsvUtils } from './csv.utils';
import { RewardChartComponent } from './reward.chart.component';

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
    RewardChartComponent,
  ],
})
export class StatisticsComponent extends BaseWatcherComponent implements OnInit {
  DateUtils = DateUtils;
  totalRewards: string;
  selectedTab: string;
  sortedInputs: Input[];
  detailInputs: Input[];
  window: HTMLElement = document.body;
  detailInputsSize = 100;
  version: string | null;
  selectedPeriod: Period | null;
  addressesForDisplay: Address[];
  shareSupport = false;

  @ViewChild('detailsContainer') detailsContainer!: ElementRef;
  filterDateActive = false;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  amounts: DateNumberPoint[] = [];

  constructor(
    injector: Injector,
    private serviceWorkerService: ServiceWorkerService,
  ) {
    super(injector);
    this.totalRewards = '';
    this.selectedTab = 'chart';
    this.addressesForDisplay = [];
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
    const result = this.dataService.getInputsPart(size, this.fromDate, this.toDate);
    return result ? result : [];
  }

  showHomeLink(): boolean {
    return this.browserService.showHomeLink() ?? false;
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  async retrieveData(): Promise<void> {
    this.selectedPeriod =
      this.selectedPeriod == null
        ? Period.All
        : (localStorage.getItem('statisticsPeriod') as Period);

    this.sortedInputs = DateUtils.filterByPeriod(
      this.dataService.getSortedInputs(true, null, null) ?? [],
      this.selectedPeriod,
    );

    this.amounts = this.sortedInputs.map((s) => {
      return { x: s.inputDate, y: s.amount } as DateNumberPoint;
    });

    this.detailInputs = this.getDetailInputs(this.detailInputsSize);

    this.addressesForDisplay = await this.dataService.getAddressesForDisplay(
      this.dataService.rsnInputs,
    );
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
    this.SetupRoute();
    this.shareSupport = navigator.share != null && navigator.share != undefined;

    await this.subscribeToEvent<Input[]>(EventType.RefreshInputs, async () => {
      await this.retrieveData();
    });

    this.version = this.serviceWorkerService.getVersion();
    await this.subscribeToEvent<string>(EventType.VersionUpdated, async (v) => {
      this.version = v;
    });

    await this.eventService.sendEventWithData(
      EventType.StatisticsScreenLoaded,
      this.storageService.getProfile() as EventData,
    );
  }

  title = 'rosen-watcher-pwa';
}
