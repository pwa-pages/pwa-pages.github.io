import { Component, effect, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { EventType } from '../service/event.service';
import { WatchersDataService, WatchersStats } from '../service/watchers.data.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ChainType } from '../../service/ts/models/chaintype';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-watchers',
  templateUrl: './watchers.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class WatchersComponent extends BaseWatcherComponent implements OnInit {
  @Input() renderHtml = true;
  @Output() notifyWatchersStatsChanged = new EventEmitter<WatchersStats>();

  watchersStats: WatchersStats = new WatchersStats();
  selectedCurrency = '';

  constructor(
    injector: Injector,
    private watchersDataService: WatchersDataService,
  ) {
    super(injector);

    const watcherStats = this.watchersDataService.getWatcherStats();

    effect(() => {
      this.watchersStats = watcherStats();
      this.notifyWatchersStatsChanged.emit(this.watchersStats);
    });
  }

  onCurrencyChange(): void {
    localStorage.setItem('selectedCurrency', this.selectedCurrency as string);
  }

  getChainTypes(): ChainType[] {
    return Object.values(ChainType);
  }

  getWatcherAmounts() {
    return this.watchersStats.watchersAmounts[this.selectedCurrency as Currency];
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.selectedCurrency = localStorage.getItem('selectedCurrency') as Currency;
    this.selectedCurrency = this.selectedCurrency == null ? Currency.EUR : this.selectedCurrency;
    this.watchersDataService.download();
    this.eventService.sendEvent(EventType.WatchersScreenLoaded);
  }
}
