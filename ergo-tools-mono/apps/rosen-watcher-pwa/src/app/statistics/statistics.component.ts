import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Injector,
} from '@angular/core';
import { EventType } from '../service/event.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgStyle } from '@angular/common';
import 'chartjs-adapter-date-fns';
import { Input } from '../../service/ts/models/input';
import { Address } from '../../service/ts/models/address';
import { ServiceWorkerService } from '../service/service.worker.service';
import { FormsModule } from '@angular/forms';
import { FilterDateComponent } from './filter.date.component';
import { FilterAddressComponent } from './filter.address.component';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { DateUtils } from './date.utils';
import { CsvUtils } from './csv.utils';
import { RewardChartComponent } from './reward.chart.component';
import { ChartPoint } from '../../service/ts/models/chart.point';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.html',
  standalone: true,
  imports: [
    NgStyle,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    InfiniteScrollDirective,
    FilterDateComponent,
    RewardChartComponent,
    FilterAddressComponent,
  ],
})
export class StatisticsComponent
  extends BaseWatcherComponent
  implements OnInit
{
  DateUtils = DateUtils;
  totalRewards: string;
  selectedTab: string;
  sortedInputs: Input[];
  detailInputs: Input[];
  window: HTMLElement = document.body;
  detailInputsSize = 100;
  version: string | null;
  selectedPeriod: string | null;
  addressesForDisplay: Address[];
  shareSupport = false;

  @ViewChild('detailsContainer') detailsContainer!: ElementRef;
  filterDateActive = false;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  amounts: ChartPoint[] = [];
  filterAddressActive = false;

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
    const result = this.dataService.getInputsPart(
      size,
      this.fromDate,
      this.toDate,
      this.addressesForDisplay,
    );

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
      this.selectedPeriod ??
      (localStorage.getItem('statisticsPeriod') as string) ??
      'All';

    const availableAddresses = await this.dataService.getAddresses();
    let sortedInputs =
      this.dataService.getSortedInputs(true, availableAddresses, null, null) ??
      [];
    this.addressesForDisplay =
      await this.dataService.getAddressesFromInputs(sortedInputs);

    this.sortedInputs = DateUtils.filterByPeriod(
      sortedInputs,
      this.selectedPeriod,
    );

    if (availableAddresses && availableAddresses.length) {
      const availSet = new Set(availableAddresses);
      this.addressesForDisplay = this.addressesForDisplay.filter((a) =>
        availSet.has(a.address),
      );
    }

    {
      const addressSet = new Set(
        this.addressesForDisplay.map((a) => a.address),
      );
      this.amounts = this.sortedInputs
        .filter((s) => addressSet.has(s.outputAddress))
        .map((s) => {
          return { x: s.inputDate, y: s.amount } as ChartPoint;
        });
    }

    if (this.amounts.length > 0) {
      const total = this.amounts.reduce((sum, item) => sum + item.y, 0);
      this.totalRewards = total.toFixed(3).toString();
    }

    this.detailInputs = this.getDetailInputs(this.detailInputsSize);
  }

  filterDateClick() {
    this.filterDateActive = true;
  }

  filterAddressClick() {
    this.filterAddressActive = true;
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

  onAddressesChanged(addresses: Address[] | null) {
    if (addresses) {
      this.addressesForDisplay = addresses;
    }

    this.detailInputs = this.getDetailInputs(this.detailInputsSize);
    this.filterAddressActive = false;
  }

  installApp(): void {
    this.browserService.installApp();
  }

  async onPeriodChange(): Promise<void> {
    localStorage.setItem('statisticsPeriod', this.selectedPeriod as string);
    await this.retrieveData();
  }

  showQR(): void {
    this.browserService.showQR(this.addresses);
  }

  share(): void {
    this.browserService.share(this.addresses);
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.selectedPeriod = localStorage.getItem('statisticsPeriod') as string;
    this.SetupRoute();
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
