import {
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnInit,
  Output,
  ChangeDetectionStrategy,
  Signal
} from '@angular/core';
import { EventType } from '../service/event.service';
import {
  WatchersPerformanceStats
} from '@ergo-tools/service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IS_ELEMENTS_ACTIVE } from '../service/tokens';
import { NavigationService } from '../service/navigation.service';
import { WatchersStats } from '../service/watchers.models';
import { ChainTypeHelper } from '../imports/imports';
import { WatchersPerformanceDataService } from '../service/watchers.performance.data.service';

export class Address {
  address: string;
  Address: string;
  active = true;
  chainType: string | null | undefined;
  smallAddressForDisplay: string;
  largeAddressForDisplay: string;
  ownAddress?: boolean;

  constructor(
    address: string,
    chainType: string | null | undefined,
    active = true,
    ownAddress: boolean = false,
  ) {
    this.address = address;
    this.Address = address;
    this.smallAddressForDisplay = address.substring(0, 6) + '...';
    this.largeAddressForDisplay =
      address.substring(0, 6) +
      '...' +
      address.substring(address.length - 6, address.length);

    this.chainType = chainType;
    this.active = active;
    this.ownAddress = ownAddress;
  }
}

@Component({
  selector: 'app-watchers-performance',
  templateUrl: './watchers.performance.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule],
})
export class WatchersPerformanceComponent extends BaseWatcherComponent implements OnInit {
  private _renderHtml = true;
  public chains: string[] = ChainTypeHelper.getActiveChainTypes();
  public months: string[] = this.getCurrentAndPreviousMonths();
  readonly watcherPerformanceStats: Signal<WatchersPerformanceStats | undefined>;

  private getCurrentAndPreviousMonths(): string[] {
    const now = new Date();
    const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
    const previousMonth = new Intl.DateTimeFormat('en-US', {
      month: 'long',
    }).format(new Date(now.getFullYear(), now.getMonth() - 1, 1));

    return [currentMonth, previousMonth];
  }

  @Input()
  set renderHtml(value: string | boolean) {
    this._renderHtml = value === false || value === 'false' ? false : true;
  }

  get renderHtml(): boolean {
    return this._renderHtml;
  }

  isHtmlRenderEnabled(): boolean {
    return this._renderHtml;
  }

  @Output() notifyWatchersStatsChanged = new EventEmitter<WatchersStats>();
  selectedChain = '';
  selectedMonth = '';

  constructor(
    injector: Injector,
    private navigationService: NavigationService,
    private watchersPerformanceDataService: WatchersPerformanceDataService,
    @Inject(IS_ELEMENTS_ACTIVE) public isElementsActive: boolean,
  ) {
    super(injector);
    this.watcherPerformanceStats =
      this.watchersPerformanceDataService.watcherPerformanceStats;

  }

  async onChainChange(): Promise<void> {
    localStorage.setItem('selectedChain', this.selectedChain as string);
    await this.triggerReportsRequested();
  }

  async onMonthChange(): Promise<void> {
    localStorage.setItem('selectedMonth', this.selectedMonth as string);
    await this.triggerReportsRequested();
  }

  getChainTypes(): string[] {
    return ChainTypeHelper.getActiveChainTypes();
  }

  isChainTypeActive(chainType: string): boolean {
    return ChainTypeHelper.isChainTypeActive(chainType);
  }

  selectTab(item: string): void {
    this.navigationService.navigate(`/${item}`);
  }

  async triggerReportsRequested(): Promise<void> {
    await this.eventService.sendEventWithData(EventType.ReportsRequested, this.selectedChain);
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();


    this.selectedChain = localStorage.getItem(
      'selectedChain',
    ) as string;
    this.selectedChain =
      this.selectedChain == null ? 'Ergo' : this.selectedChain;

    this.selectedMonth = localStorage.getItem(
      'selectedMonth',
    ) as string;
    this.selectedMonth =
      this.selectedMonth == null ? this.months[0] : this.selectedMonth;

    await this.triggerReportsRequested();
  }
}
