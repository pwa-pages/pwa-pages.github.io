import { Injectable, Signal, signal } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpDownloadService } from './http.download.service';
import { Observable } from 'rxjs';
import {
  WatcherInfo,
} from '@ergo-tools/service';
import { Token } from '@ergo-tools/service';
import { PriceService } from './price.service';
import { WatchersStats } from './watchers.models';
import { ChainTypeHelper, getCurrencies } from '../imports/imports';
import { ErgSettings, getAllChainTypes } from '@ergo-tools/service';

@Injectable({
  providedIn: 'root',
})
export class WatchersDataService {
  isChainTypeActive(chainType: string): boolean {
    return ChainTypeHelper.isChainTypeActive(chainType);
  }

  readonly rsnToken =
    '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';
  readonly watchersStatsSignal = signal<WatchersStats>(new WatchersStats());
  readonly watchersStats = new WatchersStats();


  busyCounter = 0;

  constructor(
    private downloadService: HttpDownloadService,
    private priceService: PriceService
  ) {
  }

  getWatcherStats(): Signal<WatchersStats> {
    return this.watchersStatsSignal;
  }

  getWatchersInfo(): Observable<WatcherInfo> {
    const result = this.downloadService.downloadBalance(
      'SiDFfCzE1MKdUevq1vCRN1vA7ZWNQD3gPBXdGSJ3xxDbh6x1YHb9PRJgFM7kS9YUFNmP5giWuL9NLhsvhYLvvfwLQb8MZ3NM9yvLyYRixmVLnBS7QoiYSYj3ijuHVFnMtp538uGxXLfRF6bsaW68dbnjDuHMVtNccjHYgSTBiWNkWja8sDMSm635rvMeB61ARKpTQmR5Wf1T9NJnVutjazhX9nABq8L46d2jSYgtKVDiSv4cFZPZ4Y5S1fDDJYP2PLnKx3gRFqN89JWHhGWwh5SQgU73Dc2EbHQx3G39Ah6MSntJKc345LW6AnZjqqc2qg8xsNXtdxD6NcuWWnKnYrXABKPR6Tc7isRb4FoGxn7dWPaMDEhxCH2GsTNjM1CdYqdEEXauFkPiA2faRY6qDkVKdZ2G4wDdRcTUcyxK5KCciGi3UgCWpPxuXDp6b3YMBMqPan78xM2ttrDeS4ns1vq9rhPEyJG9Gj3m7epBMEXh6vdjLA5pCwnKMySyHNYviTv7nwCxG1A4bEzFNTxKqoJLHD1gUssBC2xrrkxj3ubgGz3YN6L5jVKmzce16XPVtqZfusiAC611kX34Hd4F9oCU'
    );

    return result;
  }

  getPermitsInfo(chainType: string): Observable<Token | undefined> {
    const address = ChainTypeHelper.getPermitAddresses()[chainType];
    if (address === null) {
      return new Observable<Token | undefined>((subscriber) => {
        subscriber.next(undefined);
        subscriber.complete();
      });
    }
    return this.downloadPermitInfo(address, this.rsnToken, null);
  }

  private updateTotal(
    map: Record<string, number | undefined>,
  ): number | undefined {
    return Object.values(map).reduce((acc, val) => (acc ?? 0) + (val ?? 0), 0);
  }

  private convertCurrencies(): void {
    getCurrencies().forEach((currency) => {
      const conversions = [
        {
          amount: ErgSettings.rs_WatcherCollateralRSN('Ergo'),
          from: 'RSN',
          callback: (c: number) =>
          (this.watchersStats.watchersAmountsPerCurrency[
            currency
          ].rsnCollateral = c),
        },
        {
          amount: ErgSettings.rs_WatcherCollateralERG('Ergo'),
          from: 'ERG',
          callback: (c: number) =>
          (this.watchersStats.watchersAmountsPerCurrency[
            currency
          ].ergCollateral = c),
        },
        {
          amount: ErgSettings.rs_PermitCost(),
          from: 'RSN',
          callback: (c: number) =>
          (this.watchersStats.watchersAmountsPerCurrency[
            currency
          ].permitValue = c),
        },
        {
          amount: this.watchersStats.totalLockedERG ?? 0,
          from: 'ERG',
          callback: (l: number) =>
          (this.watchersStats.watchersAmountsPerCurrency[
            currency
          ].totalLockedERG = l),
        },
        {
          amount:
            (this.watchersStats.totalLockedRSN ?? 0) +
            ErgSettings.rs_PermitCost() * (this.watchersStats.totalPermitCount ?? 0),
          from: 'RSN',
          callback: (l: number) =>
          (this.watchersStats.watchersAmountsPerCurrency[
            currency
          ].totalLockedRSN = l),
        },
      ];

      conversions.forEach(({ amount, from, callback }) => {
        this.priceService
          .convert(amount, from, currency ?? '')
          .subscribe(callback);
      });
    });
  }

  private updateTotalLocked(): void {
    getCurrencies().forEach((currency) => {
      this.watchersStats.watchersAmountsPerCurrency[currency].totalLocked =
        (this.watchersStats.watchersAmountsPerCurrency[currency]
          .totalLockedERG ?? 0) +
        (this.watchersStats.watchersAmountsPerCurrency[currency]
          .totalLockedRSN ?? 0);
    });
  }
  private getValue(
    map: Record<string, number | undefined>,
    chainType: string,
    multiplier: number,
  ): number {
    return (map[chainType] ?? 0) * multiplier;
  }

  setLockedAmounts(chainType: string): void {
    this.watchersStats.chainLockedRSN[chainType] =
      this.getValue(
        this.watchersStats.chainPermitCount,
        chainType,
        ErgSettings.rs_PermitCost(),
      ) +
      this.getValue(
        this.watchersStats.chainWatcherCount,
        chainType,
        ErgSettings.rs_WatcherCollateralRSN(chainType)
      );

    this.watchersStats.chainLockedERG[chainType] = this.getValue(
      this.watchersStats.chainWatcherCount,
      chainType,
      ErgSettings.rs_WatcherCollateralERG(chainType),
    );

    getAllChainTypes().forEach((c) => {
      this.watchersStats.activePermitCount[c] =
        (this.watchersStats.bulkPermitCount[c] ?? 0) +
        (this.watchersStats.triggerPermitCount[c] ?? 0);
    });

    this.watchersStats.totalWatcherCount = this.updateTotal(
      this.watchersStats.chainWatcherCount,
    );
    this.watchersStats.totalPermitCount = this.updateTotal(
      this.watchersStats.chainPermitCount,
    );
    this.watchersStats.totalActivePermitCount = this.updateTotal(
      this.watchersStats.activePermitCount,
    );
    this.watchersStats.totalLockedRSN = this.updateTotal(
      this.watchersStats.chainLockedRSN,
    );
    this.watchersStats.totalLockedERG = this.updateTotal(
      this.watchersStats.chainLockedERG,
    );

    this.currencyUpdate();
  }

  currencyUpdate(): void {
    getCurrencies().forEach((currency) => {
      this.watchersStats.watchersAmountsPerCurrency[currency].watcherValue = 0;
      this.watchersStats.watchersAmountsPerCurrency[currency].permitValue = 0;
    });

    this.convertCurrencies();
    this.updateTotalLocked();

    getCurrencies().forEach((currency) => {
      this.watchersStats.watchersAmountsPerCurrency[currency].watcherValue =
        (this.watchersStats.watchersAmountsPerCurrency[currency]
          .rsnCollateral ?? 0) +
        (this.watchersStats.watchersAmountsPerCurrency[currency]
          .ergCollateral ?? 0);
    });

    const newStats = JSON.stringify(this.watchersStats);
    if (JSON.stringify(this.watchersStatsSignal()) !== newStats) {
      console.log('Settings watchers stats signal');
      this.watchersStatsSignal.set(JSON.parse(newStats));
    }
  }

  private downloadPermitInfo(
    address: string,
    tokenId: string | null,
    tokenName: string | null,
  ) {
    return this.downloadService
      .downloadBalance(address)
      .pipe(
        map((data: { tokens: Token[] }) => {
          if (data.tokens) {
            const tokenData = data.tokens.find(
              (token: Token) =>
                (tokenId && token.tokenId === tokenId) ||
                (tokenName && token.name === tokenName),
            );

            if (tokenData) {
              tokenData.amount /=
                ErgSettings.rs_PermitCost() * Math.pow(10, tokenData.decimals);
              tokenData.amount = Math.floor(tokenData.amount);
            }
          }
          return data;
        }),
      )
      .pipe(
        map((result) => {
          return result.tokens.find(
            (token: Token) =>
              (tokenId && token.tokenId === tokenId) ||
              (tokenName && token.name === tokenName),
          );
        }),
      );
  }

  getTriggerPermitsInfo(chainType: string): Observable<Token | undefined> {
    const address = ChainTypeHelper.getPermitTriggerAddresses()[chainType];
    if (address === null) {
      return new Observable<Token | undefined>((subscriber) => {
        subscriber.next(undefined);
        subscriber.complete();
      });
    }

    return this.downloadPermitInfo(address, null, ChainTypeHelper.getChainTypeTokens()[chainType]);
  }

  getBulkPermitsInfo(chainType: string): Observable<Token | undefined> {
    const address = ChainTypeHelper.getPermitBulkAddresses()[chainType];

    if (address === null) {
      return new Observable<Token | undefined>((subscriber) => {
        subscriber.next(undefined);
        subscriber.complete();
      });
    }

    return this.downloadPermitInfo(address, null, ChainTypeHelper.getChainTypeTokens()[chainType]);
  }

  download(): Signal<WatchersStats> {
    ChainTypeHelper.getAllChainTypes().forEach((c) => {
      this.getTriggerPermitsInfo(c)
        .pipe(map((permitsInfo) => permitsInfo?.amount))
        .subscribe((amount) => {
          this.watchersStats.triggerPermitCount[c] = amount;
          this.setLockedAmounts(c);
        });

      this.getBulkPermitsInfo(c)
        .pipe(map((permitsInfo) => permitsInfo?.amount))
        .subscribe((amount) => {
          this.watchersStats.bulkPermitCount[c] = amount;
          this.setLockedAmounts(c);
        });


    });

    const watcherInfo$ = this.getWatchersInfo();

    watcherInfo$
      .pipe(
        map((watcherInfo) => {
          ChainTypeHelper.getAllChainTypes().forEach((c) => {
            const amount =
              watcherInfo.tokens.find(
                (token: Token) => token.name === ChainTypeHelper.getChainTypeWatcherIdentifiers()[c],
              )?.amount ?? 0;
            this.watchersStats.chainWatcherCount[c] = amount;
            this.setLockedAmounts(c);
          });
        }),
      )
      .subscribe();

    ChainTypeHelper.getAllChainTypes().forEach((c) => {
      this.getPermitsInfo(c)
        .pipe(map((permitsInfo) => permitsInfo?.amount))
        .subscribe((amount) => {
          this.watchersStats.chainPermitCount[c] = amount;
          this.setLockedAmounts(c);
        });
    });

    return this.watchersStatsSignal;
  }
}
