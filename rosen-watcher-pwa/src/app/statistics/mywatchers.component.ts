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
import { MyWatchersStats, WatchersDataService } from '../service/watchers.data.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IS_ELEMENTS_ACTIVE } from '../service/tokens';
import { NavigationService } from '../service/navigation.service';

@Component({
  selector: 'app-mywatchers',
  templateUrl: './mywatchers.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class MyWatchersComponent extends BaseWatcherComponent implements OnInit {
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

  selectTab(): void {
    this.navigationService.navigate('/watchers');
  }

  @Output() notifyWatchersStatsChanged = new EventEmitter<MyWatchersStats>();

  myWatchersStats: MyWatchersStats = new MyWatchersStats();
  selectedCurrency = '';

  constructor(
    injector: Injector,
    private watchersDataService: WatchersDataService,
    private navigationService: NavigationService,
    @Inject(IS_ELEMENTS_ACTIVE) public isElementsActive: boolean,
  ) {
    super(injector);

    const myWatcherStats = this.watchersDataService.getMyWatcherStats();

    effect(() => {
      this.myWatchersStats = myWatcherStats();
      console.log('Sending watchers stats changed event');
      this.eventService.sendEventWithData(EventType.WatchersStatsChanged, this.myWatchersStats);
    });
  }

  onCurrencyChange(): void {
    localStorage.setItem('selectedCurrency', this.selectedCurrency as string);
  }

  getChainTypes(): ChainType[] {
    return Object.values(ChainType);
  }

  isChainTypeActive(chainType: ChainType): boolean {
    return this.watchersDataService.isChainTypeActive(chainType);
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.selectedCurrency = localStorage.getItem('selectedCurrency') as Currency;
    this.selectedCurrency = this.selectedCurrency == null ? Currency.EUR : this.selectedCurrency;
    this.watchersDataService.download();
    this.eventService.sendEvent(EventType.WatchersScreenLoaded);
  }
}
