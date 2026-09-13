import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input as AngularInput,
  OnChanges,
  OnInit,
  Output,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { EventType } from '../service/event.service';
import { WatchersDataService } from '../service/watchers.data.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { IS_ELEMENTS_ACTIVE } from '../service/tokens';
import { NavigationService } from '../service/navigation.service';
import { ChainDataService } from '../service/chain.data.service';
import { ChainTypeHelper } from '../imports/imports';
import { MyWatchersStats } from '@ergo-tools/service';

@Component({
  selector: 'app-mywatchers',
  templateUrl: './mywatchers.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule],
})
export class MyWatchersComponent
  extends BaseWatcherComponent
  implements OnInit, OnChanges
{
  private _renderHtml = true;

  public myWatcherStats = signal<MyWatchersStats[]>([]);

  public processedChainTypes: Partial<Record<string, boolean>> = {};

  @AngularInput()
  filledAddresses: string[] = [];

  prevFilledAddresses: string[] = [];

  @AngularInput()
  set renderHtml(value: string | boolean) {
    this._renderHtml =
      value === false || value === 'false' ? false : true;
  }

  get renderHtml(): boolean {
    return this._renderHtml;
  }

  isHtmlRenderEnabled(): boolean {
    return this._renderHtml;
  }

  @Output()
  notifyPermitsStatsChanged =
    new EventEmitter<MyWatchersStats>();

  selectedCurrency = '';

  constructor(
    injector: Injector,
    private watchersDataService: WatchersDataService,
    private navigationService: NavigationService,
    private chaindataService: ChainDataService,
    @Inject(IS_ELEMENTS_ACTIVE)
    public isElementsActive: boolean,
  ) {
    super(injector);
  }

  selectTab(): void {
    this.navigationService.navigate('/watchers');
  }

  onCurrencyChange(): void {
    localStorage.setItem(
      'selectedCurrency',
      this.selectedCurrency,
    );
  }

  getChainTypes(): string[] {
    return ChainTypeHelper.getAllChainTypes();
  }

  isChainTypeActive(chainType: string): boolean {
    return this.watchersDataService.isChainTypeActive(
      chainType,
    );
  }

  async ngOnChanges(): Promise<void> {
    if (
      !this.prevFilledAddresses ||
      this.filledAddresses.length !==
        this.prevFilledAddresses.length ||
      !this.filledAddresses.every(
        (addr, i) =>
          addr === this.prevFilledAddresses[i],
      )
    ) {
      this.prevFilledAddresses = [
        ...this.filledAddresses,
      ];

      await this.initializeAddresses();
    }
  }

  async initializeAddresses(): Promise<void> {
    if (!this.isElementsActive) {
      const addresses =
        await this.chaindataService.getAddresses();

      this.eventService.sendEventWithData(
        EventType.MyWatchersScreenLoaded,
        {
          addresses,
        },
      );
    } else {
      this.eventService.sendEventWithData(
        EventType.MyWatchersScreenLoaded,
        {
          addresses: this.filledAddresses,
        },
      );
    }
  }

  private async getAddresses(): Promise<string[]> {
    if (this.isElementsActive) {
      return this.filledAddresses;
    }

    return await this.chaindataService.getAddresses();
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.selectedCurrency =
      localStorage.getItem('selectedCurrency') ?? 'EUR';

    await this.initializeAddresses();

    await this.subscribeToEvent<unknown[]>(
      EventType.RefreshPermits,
      async () => {
        const result =
          await this.watchersDataService.getMyWatcherStats(
            await this.getAddresses(),
          );

        const stats: MyWatchersStats[] =
          Object.entries(result).map(
            ([key, value]) => ({
              key,
              ...value,
            }),
          );

        console.log(
          'MyWatcherStats retrieved:',
          stats,
        );

        this.myWatcherStats.set(stats);

        this.eventService.sendEventWithData(
          EventType.PermitsStatsChanged,
          stats,
        );
      },
    );
  }
}