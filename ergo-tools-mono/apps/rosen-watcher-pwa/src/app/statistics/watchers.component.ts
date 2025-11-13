import {
  Component,
  effect,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { EventType } from '../service/event.service';
import { WatchersDataService } from '../service/watchers.data.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IS_ELEMENTS_ACTIVE } from '../service/tokens';
import { NavigationService } from '../service/navigation.service';
import { WatchersStats } from '../service/watchers.models';
import { ChainTypeHelper } from '../imports/imports';

@Component({
  selector: 'app-watchers',
  templateUrl: './watchers.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class WatchersComponent extends BaseWatcherComponent implements OnInit {
  private _renderHtml = true;

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

  watchersStats: WatchersStats = new WatchersStats();
  selectedCurrency = '';

  constructor(
    injector: Injector,
    private watchersDataService: WatchersDataService,
    private navigationService: NavigationService,
    @Inject(IS_ELEMENTS_ACTIVE) public isElementsActive: boolean,
  ) {
    super(injector);

    const watcherStats = this.watchersDataService.getWatcherStats();

    effect(() => {
      this.watchersStats = watcherStats();
      console.log('Sending watchers stats changed event');
      this.eventService.sendEventWithData(
        EventType.WatchersStatsChanged,
        this.watchersStats,
      );
    });
  }

  onCurrencyChange(): void {
    localStorage.setItem('selectedCurrency', this.selectedCurrency as string);
  }

  getChainTypes(): string[] {
    return ChainTypeHelper.getAllChainTypes();
  }

  isChainTypeActive(chainType: string): boolean {
    return this.watchersDataService.isChainTypeActive(chainType);
  }

  getWatcherAmounts() {
    return this.watchersStats.watchersAmountsPerCurrency[
      this.selectedCurrency as string
    ];
  }

  selectTab(): void {
    this.navigationService.navigate('/mywatchers');
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.selectedCurrency = localStorage.getItem(
      'selectedCurrency',
    ) as string;
    this.selectedCurrency =
      this.selectedCurrency == null ? 'EUR' : this.selectedCurrency;
    this.watchersDataService.download();
    this.eventService.sendEvent(EventType.WatchersScreenLoaded);
  }
}
