import {
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input as AngularInput,
  OnInit,
  Output,
  OnChanges,
} from '@angular/core';
import { EventType } from '../service/event.service';
import { WatchersDataService } from '../service/watchers.data.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IS_ELEMENTS_ACTIVE } from '../service/tokens';
import { NavigationService } from '../service/navigation.service';
import { MyWatchersStats } from '../../service/ts/models/watcher.info';
import { ChainDataService } from '../service/chain.data.service';

@Component({
  selector: 'app-mywatchers',
  templateUrl: './mywatchers.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class MyWatchersComponent extends BaseWatcherComponent implements OnInit, OnChanges {
  private _renderHtml = true;
  public myWatcherStats: MyWatchersStats[] = [];
  public processedChainTypes: Partial<Record<ChainType, boolean>> = {};
  @AngularInput()
  filledAddresses: string[] = [];
  prevFilledAddresses: string[] = [];

  @AngularInput()
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

  @Output() notifyPermitsStatsChanged = new EventEmitter<MyWatchersStats>();

  selectedCurrency = '';

  constructor(
    injector: Injector,
    private watchersDataService: WatchersDataService,
    private navigationService: NavigationService,
    private chaindataService: ChainDataService,
    @Inject(IS_ELEMENTS_ACTIVE) public isElementsActive: boolean,
  ) {
    super(injector);
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

  async ngOnChanges(): Promise<void> {
    if (
      !this.prevFilledAddresses ||
      this.filledAddresses.length !== this.prevFilledAddresses.length ||
      !this.filledAddresses.every((addr, i) => addr === this.prevFilledAddresses![i])
    ) {
      this.prevFilledAddresses = [...this.filledAddresses];
      await this.initializeAddresses();
    }
  }

  async initializeAddresses() {
    if (!this.isElementsActive) {
      let addresses = await this.chaindataService.getAddresses();

      this.eventService.sendEventWithData(EventType.MyWatchersScreenLoaded, {
        addresses: addresses,
      });
    } else {
      this.eventService.sendEventWithData(EventType.MyWatchersScreenLoaded, {
        addresses: this.filledAddresses,
      });
    }
  }

  private async getAddresses(): Promise<string[]> {
    if (this.isElementsActive) {
      return this.filledAddresses;
    } else {
      return await this.chaindataService.getAddresses();
    }
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.selectedCurrency = localStorage.getItem('selectedCurrency') as Currency;
    this.selectedCurrency = this.selectedCurrency == null ? Currency.EUR : this.selectedCurrency;

    await this.initializeAddresses();

    await this.subscribeToEvent<Input[]>(EventType.RefreshPermits, async () => {
      this.myWatcherStats = Object.entries(
        await this.watchersDataService.getMyWatcherStats(await this.getAddresses()),
      ).map(([key, value]) => ({ key, ...value }));

      this.eventService.sendEventWithData(EventType.PermitsStatsChanged, this.myWatcherStats);
    });
  }
}
