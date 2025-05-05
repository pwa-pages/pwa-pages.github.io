import { Component, Injector, OnInit } from '@angular/core';
import { EventType } from '../service/event.service';
import { createChainNumber, WatchersDataService } from '../service/watchers.data.service';
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
  chainWatcherCount = createChainNumber();
  chainPermitCount = createChainNumber();
  activePermitCount = createChainNumber();
  triggerPermitCount = createChainNumber();
  bulkPermitCount = createChainNumber();
  chainLockedRSN = createChainNumber();
  chainLockedERG = createChainNumber();

  rs_PermitCost = rs_PermitCost;
  rs_WatcherCollateralRSN = rs_WatcherCollateralRSN;
  rs_WatcherCollateralERG = rs_WatcherCollateralERG;
  totalWatcherCount: number | undefined;
  totalPermitCount: number | undefined;
  totalActivePermitCount: number | undefined;
  totalLockedRSN: number | undefined;
  totalLockedERG: number | undefined;
  totalLockedRSNConverted: number | undefined;
  totalLockedERGConverted: number | undefined;
  totalLocked: number | undefined;
  watcherValue: number | undefined;
  permitValue: number | undefined;
  rsnCollateralValue: number | undefined;
  ergCollateralValue: number | undefined;
  selectedCurrency: Currency | null = null;

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
    const conversions = [
      {
        amount: rs_WatcherCollateralRSN,
        from: 'RSN',
        callback: (c: number) => (this.rsnCollateralValue = c),
      },
      {
        amount: rs_WatcherCollateralERG,
        from: 'ERG',
        callback: (c: number) => (this.ergCollateralValue = c),
      },
      { amount: rs_PermitCost, from: 'RSN', callback: (c: number) => (this.permitValue = c) },
      {
        amount: this.totalLockedERG ?? 0,
        from: 'ERG',
        callback: (l: number) => (this.totalLockedERGConverted = l),
      },
      {
        amount: (this.totalLockedRSN ?? 0) + rs_PermitCost * (this.totalPermitCount ?? 0),
        from: 'RSN',
        callback: (l: number) => (this.totalLockedRSNConverted = l),
      },
    ];

    conversions.forEach(({ amount, from, callback }) => {
      this.priceService.convert(amount, from, this.selectedCurrency ?? '').subscribe(callback);
    });
  }

  private updateTotalLocked(): void {
    this.totalLocked = (this.totalLockedERGConverted ?? 0) + (this.totalLockedRSNConverted ?? 0);
  }

  setLockedAmounts(chainType: ChainType): void {
    this.chainLockedRSN[chainType] =
      this.getValue(this.chainPermitCount, chainType, rs_PermitCost) +
      this.getValue(this.chainWatcherCount, chainType, rs_WatcherCollateralRSN);

    this.chainLockedERG[chainType] = this.getValue(
      this.chainWatcherCount,
      chainType,
      rs_WatcherCollateralERG,
    );

    Object.values(ChainType).forEach((c) => {
      this.activePermitCount[c] =
        (this.bulkPermitCount[c] ?? 0) + (this.triggerPermitCount[c] ?? 0);
    });

    this.totalWatcherCount = this.updateTotal(this.chainWatcherCount);
    this.totalPermitCount = this.updateTotal(this.chainPermitCount);
    this.totalActivePermitCount = this.updateTotal(this.activePermitCount);
    this.totalLockedRSN = this.updateTotal(this.chainLockedRSN);
    this.totalLockedERG = this.updateTotal(this.chainLockedERG);

    this.currencyUpdate();
  }

  currencyUpdate(): void {
    this.watcherValue = 0;
    this.permitValue = 0;

    this.convertCurrencies();
    this.updateTotalLocked();

    this.watcherValue = (this.rsnCollateralValue ?? 0) + (this.ergCollateralValue ?? 0);
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.selectedCurrency = localStorage.getItem('selectedCurrency') as Currency;
    this.selectedCurrency = this.selectedCurrency == null ? Currency.EUR : this.selectedCurrency;
    this.currencyUpdate();

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
          this.chainWatcherCount[c] = amount;
          this.setLockedAmounts(c);
        });

      this.watchersDataService
        .getPermitsInfo(c)
        .pipe(map((permitsInfo) => permitsInfo?.amount))
        .subscribe((amount) => {
          this.chainPermitCount[c] = amount;
          this.setLockedAmounts(c);
        });

      this.watchersDataService
        .getTriggerPermitsInfo(c)
        .pipe(map((permitsInfo) => permitsInfo?.amount))
        .subscribe((amount) => {
          this.triggerPermitCount[c] = amount;
          this.setLockedAmounts(c);
        });

      this.watchersDataService
        .getBulkPermitsInfo(c)
        .pipe(map((permitsInfo) => permitsInfo?.amount))
        .subscribe((amount) => {
          this.bulkPermitCount[c] = amount;
          this.setLockedAmounts(c);
        });
    });

    this.eventService.sendEvent(EventType.WatchersScreenLoaded);
  }
}
