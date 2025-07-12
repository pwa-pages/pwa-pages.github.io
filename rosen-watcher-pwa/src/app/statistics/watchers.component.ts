import { Component, Injector, OnInit } from '@angular/core';
import { EventType } from '../service/event.service';
import { WatchersDataService, WatchersStats } from '../service/watchers.data.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { map } from 'rxjs/operators';
import { ChainType } from '../../service/ts/models/chaintype';
import { Token } from '../../service/ts/models/token';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PriceService } from '../service/price.service';

@Component({
  selector: 'app-watchers',
  templateUrl: './watchers.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class WatchersComponent extends BaseWatcherComponent implements OnInit {
  watcherStats: WatchersStats = new WatchersStats();
  selectedCurrency = '';

  constructor(
    injector: Injector,
    private watchersDataService: WatchersDataService,
    private priceService: PriceService,
  ) {
    super(injector);
  }

  onCurrencyChange(): void {
    localStorage.setItem('selectedCurrency', this.selectedCurrency as string);
    this.currencyUpdate();
  }

  private getValue(
    map: Record<ChainType, number | undefined>,
    chainType: ChainType,
    multiplier: number,
  ): number {
    return (map[chainType] ?? 0) * multiplier;
  }

  private updateTotal(map: Record<ChainType, number | undefined>): number | undefined {
    return Object.values(map).reduce((acc, val) => (acc ?? 0) + (val ?? 0), 0);
  }

  private convertCurrencies(): void {
    Object.values(Currency).forEach((currency) => {
      const conversions = [
        {
          amount: rs_WatcherCollateralRSN,
          from: 'RSN',
          callback: (c: number) =>
            (this.watcherStats.watchersAmounts[currency].rsnCollateralValue = c),
        },
        {
          amount: rs_WatcherCollateralERG,
          from: 'ERG',
          callback: (c: number) =>
            (this.watcherStats.watchersAmounts[currency].ergCollateralValue = c),
        },
        {
          amount: rs_PermitCost,
          from: 'RSN',
          callback: (c: number) => (this.watcherStats.watchersAmounts[currency].permitValue = c),
        },
        {
          amount: this.watcherStats.watchersAmounts[currency].totalLockedERG ?? 0,
          from: 'ERG',
          callback: (l: number) =>
            (this.watcherStats.watchersAmounts[currency].totalLockedERGConverted = l),
        },
        {
          amount:
            (this.watcherStats.watchersAmounts[currency].totalLockedRSN ?? 0) +
            rs_PermitCost * (this.watcherStats.totalPermitCount ?? 0),
          from: 'RSN',
          callback: (l: number) =>
            (this.watcherStats.watchersAmounts[currency].totalLockedRSNConverted = l),
        },
      ];

      conversions.forEach(({ amount, from, callback }) => {
        this.priceService.convert(amount, from, currency ?? '').subscribe(callback);
      });
    });
  }

  private updateTotalLocked(): void {
    Object.values(Currency).forEach((currency) => {
      this.watcherStats.watchersAmounts[currency].totalLocked =
        (this.watcherStats.watchersAmounts[currency].totalLockedERGConverted ?? 0) +
        (this.watcherStats.watchersAmounts[currency].totalLockedRSNConverted ?? 0);
    });
  }

  setLockedAmounts(chainType: ChainType): void {
    Object.values(Currency).forEach((currency) => {
      this.watcherStats.watchersAmounts[currency].chainLockedRSN[chainType] =
        this.getValue(this.watcherStats.chainPermitCount, chainType, rs_PermitCost) +
        this.getValue(this.watcherStats.chainWatcherCount, chainType, rs_WatcherCollateralRSN);

      this.watcherStats.watchersAmounts[currency].chainLockedERG[chainType] = this.getValue(
        this.watcherStats.chainWatcherCount,
        chainType,
        rs_WatcherCollateralERG,
      );

      Object.values(ChainType).forEach((c) => {
        this.watcherStats.activePermitCount[c] =
          (this.watcherStats.bulkPermitCount[c] ?? 0) +
          (this.watcherStats.triggerPermitCount[c] ?? 0);
      });

      this.watcherStats.totalWatcherCount = this.updateTotal(this.watcherStats.chainWatcherCount);
      this.watcherStats.totalPermitCount = this.updateTotal(this.watcherStats.chainPermitCount);
      this.watcherStats.totalActivePermitCount = this.updateTotal(
        this.watcherStats.activePermitCount,
      );
      this.watcherStats.watchersAmounts[currency].totalLockedRSN = this.updateTotal(
        this.watcherStats.watchersAmounts[currency].chainLockedRSN,
      );
      this.watcherStats.watchersAmounts[currency].totalLockedERG = this.updateTotal(
        this.watcherStats.watchersAmounts[currency].chainLockedERG,
      );
    });

    this.currencyUpdate();
  }

  getWatcherAmounts() {
    return this.watcherStats.watchersAmounts[this.selectedCurrency as Currency];
  }

  currencyUpdate(): void {
    Object.values(Currency).forEach((currency) => {
      this.watcherStats.watchersAmounts[currency].watcherValue = 0;
      this.watcherStats.watchersAmounts[currency].permitValue = 0;
    });

    this.convertCurrencies();
    this.updateTotalLocked();

    Object.values(Currency).forEach((currency) => {
      this.watcherStats.watchersAmounts[currency].watcherValue =
        (this.watcherStats.watchersAmounts[currency].rsnCollateralValue ?? 0) +
        (this.watcherStats.watchersAmounts[currency].ergCollateralValue ?? 0);
    });
  }

  getChainTypes(): ChainType[] {
    return Object.values(ChainType);
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.selectedCurrency = localStorage.getItem('selectedCurrency') as Currency;
    this.selectedCurrency = this.selectedCurrency == null ? Currency.EUR : this.selectedCurrency;
    this.currencyUpdate();

    Object.values(ChainType).forEach((c) => {
      this.watchersDataService
        .getTriggerPermitsInfo(c)
        .pipe(map((permitsInfo) => permitsInfo?.amount))
        .subscribe((amount) => {
          this.watcherStats.triggerPermitCount[c] = amount;
          this.setLockedAmounts(c);
        });

      this.watchersDataService
        .getBulkPermitsInfo(c)
        .pipe(map((permitsInfo) => permitsInfo?.amount))
        .subscribe((amount) => {
          this.watcherStats.bulkPermitCount[c] = amount;
          this.setLockedAmounts(c);
        });
    });

    const watcherInfo$ = this.watchersDataService.getWatchersInfo();

    Object.values(ChainType).forEach((c) => {
      watcherInfo$
        .pipe(
          map(
            (watcherInfo) =>
              watcherInfo.tokens.find((token: Token) => token.name === 'rspv2' + c + 'AWC')
                ?.amount ?? 0,
          ),
        )
        .subscribe((amount) => {
          this.watcherStats.chainWatcherCount[c] = amount;
          this.setLockedAmounts(c);
        });

      this.watchersDataService
        .getPermitsInfo(c)
        .pipe(map((permitsInfo) => permitsInfo?.amount))
        .subscribe((amount) => {
          this.watcherStats.chainPermitCount[c] = amount;
          this.setLockedAmounts(c);
        });
    });

    this.eventService.sendEvent(EventType.WatchersScreenLoaded);
  }
}
