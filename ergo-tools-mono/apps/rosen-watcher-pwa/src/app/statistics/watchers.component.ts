import {
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnInit,
  Output,
  ChangeDetectionStrategy
} from '@angular/core';

import { BaseWatcherComponent } from '../basewatchercomponent';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IS_ELEMENTS_ACTIVE } from '../service/tokens';
import { NavigationService } from '../service/navigation.service';
import { getActiveChainTypes, getChainTypes } from 'service/src/lib/chain.service';
import { EventType, WatchersStats } from '@ergo-tools/service';

@Component({
  selector: 'app-watchers',
  templateUrl: './watchers.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
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
    //private watchersDataService: WatchersDataService,
    private navigationService: NavigationService,
    @Inject(IS_ELEMENTS_ACTIVE) public isElementsActive: boolean,
  ) {
    super(injector);


  }

  onCurrencyChange(): void {
    localStorage.setItem('selectedCurrency', this.selectedCurrency as string);
  }

  getChainTypes(): string[] {
    return getChainTypes();
  }

  isChainTypeActive(chainType: string): boolean {
    return (getActiveChainTypes() as string[]).includes(chainType);
  }

  getWatcherAmounts() {
    return this.watchersStats.watchersAmountsPerCurrency[
      this.selectedCurrency as string
    ];
  }

  selectTab(item: string): void {
    this.navigationService.navigate(`/${item}`);
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.selectedCurrency = localStorage.getItem(
      'selectedCurrency',
    ) as string;
    this.selectedCurrency =
      this.selectedCurrency == null ? 'EUR' : this.selectedCurrency;

    this.eventService.sendEvent(EventType.WatchersScreenLoaded);

    this.subscribeToEvent(
      EventType.WatchersStatsChanged,
      (data: WatchersStats) => {
        this.watchersStats = data;
      },
    );
  }
}
