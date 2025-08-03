import { Injectable, Signal, signal } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpDownloadService } from './http.download.service';
import { Observable } from 'rxjs';
import { ChainType } from '../../service/ts/models/chaintype';
import { WatcherInfo } from '../../service/ts/models/watcher.info';
import { Token } from '../../service/ts/models/token';
import { PriceService } from './price.service';

export function createChainNumber(): Record<ChainType, number | undefined> {
  return Object.fromEntries(Object.values(ChainType).map((key) => [key, undefined])) as Record<
    ChainType,
    number | undefined
  >;
}

export class WatchersAmounts {
  ergCollateral: number | undefined;
  permitValue: number | undefined;
  rsnCollateral: number | undefined;
  totalLocked: number | undefined;
  totalLockedERG: number | undefined;
  totalLockedRSN: number | undefined;
  watcherValue: number | undefined;
}

export class WatchersStats {
  activePermitCount = createChainNumber();
  bulkPermitCount = createChainNumber();
  chainLockedERG = createChainNumber();
  chainLockedRSN = createChainNumber();
  chainPermitCount = createChainNumber();
  chainWatcherCount = createChainNumber();
  permitCost = rs_PermitCost;
  totalActivePermitCount: number | undefined;
  totalLockedERG: number | undefined;
  totalLockedRSN: number | undefined;
  totalPermitCount: number | undefined;
  totalWatcherCount: number | undefined;
  triggerPermitCount = createChainNumber();
  watcherCollateralERG = rs_WatcherCollateralERG;
  watcherCollateralRSN = rs_WatcherCollateralRSN;

  watchersAmountsPerCurrency: Record<Currency, WatchersAmounts> = Object.fromEntries(
    Object.values(Currency).map((currency) => [currency, new WatchersAmounts()]),
  ) as Record<Currency, WatchersAmounts>;
}

@Injectable({
  providedIn: 'root',
})
export class WatchersDataService {
  readonly watcherUrl =
    'https://' +
    rs_ErgoExplorerHost +
    '/api/v1/addresses/ChTbcUHgBNqNMVjzV1dvCb2UDrX9nh6rGGcURCFEYXuH5ykKh7Ea3FvpFhHb9AnxXJkgAZ6WASN7Rdn7VMgkFaqP5Z5RWp84cDTmsZkhYrgAVGN7mjeLs8UxqUvRi2ArZbm35Xqk8Y88Uq2MJzmDVHLHzCYRGym8XPxFM4YEVxqzHSKYYDvaMLgKvoskFXKrvceAqEiyih26hjpekCmefiF1VmrPwwShrYYxgHLFCZdigw5JWKV4DmewuR1FH3oNtGoFok859SXeuRbpQfrTjHhGVfDsbXEo3GYP2imAh1APKyLEsG9LcE5WZnJV8eseQnYA8sACLDKZ8Tbpp9KUE7QZNFpnwGnkYx7eybbrCeFDFjTGpsBzaS6fRKrWj2J4Wy3TTyTU1F8iMCrHBF8inZPw9Kg9YEZuJMdXDFNtuaK15u86mF2s2Z5B1vdL5MtZfWThFLnixKds8ABEmGbe8n75Dym5Wv3pkEXQ6XPpaMjUxHfRJB3EfcoFM5nsZHWSTfbFBcHxSRnEiiU67cgJsBUpQn7FvEvqNLiKM4fL3yyykMtQ6RjAS8rhycszphvQa5qFrDHie4vPuTq8/balance/confirmed';

  readonly rsnToken = '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';
  readonly watchersStatsSignal = signal<WatchersStats>(new WatchersStats());
  readonly watchersStats = new WatchersStats();

  busyCounter = 0;

  constructor(
    private downloadService: HttpDownloadService,
    private priceService: PriceService,
  ) {}

  getWatcherStats(): Signal<WatchersStats> {
    return this.watchersStatsSignal;
  }

  getWatchersInfo(): Observable<WatcherInfo> {
    const result = this.downloadService.downloadStream<WatcherInfo>(this.watcherUrl);

    return result;
  }

  getPermitsInfo(chainType: ChainType): Observable<Token | undefined> {
    const address = permitAddresses[chainType];
    return this.downloadPermitInfo(address, this.rsnToken, null);
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
            (this.watchersStats.watchersAmountsPerCurrency[currency].rsnCollateral = c),
        },
        {
          amount: rs_WatcherCollateralERG,
          from: 'ERG',
          callback: (c: number) =>
            (this.watchersStats.watchersAmountsPerCurrency[currency].ergCollateral = c),
        },
        {
          amount: rs_PermitCost,
          from: 'RSN',
          callback: (c: number) =>
            (this.watchersStats.watchersAmountsPerCurrency[currency].permitValue = c),
        },
        {
          amount: this.watchersStats.totalLockedERG ?? 0,
          from: 'ERG',
          callback: (l: number) =>
            (this.watchersStats.watchersAmountsPerCurrency[currency].totalLockedERG = l),
        },
        {
          amount:
            (this.watchersStats.totalLockedRSN ?? 0) +
            rs_PermitCost * (this.watchersStats.totalPermitCount ?? 0),
          from: 'RSN',
          callback: (l: number) =>
            (this.watchersStats.watchersAmountsPerCurrency[currency].totalLockedRSN = l),
        },
      ];

      conversions.forEach(({ amount, from, callback }) => {
        this.priceService.convert(amount, from, currency ?? '').subscribe(callback);
      });
    });
  }

  private updateTotalLocked(): void {
    Object.values(Currency).forEach((currency) => {
      this.watchersStats.watchersAmountsPerCurrency[currency].totalLocked =
        (this.watchersStats.watchersAmountsPerCurrency[currency].totalLockedERG ?? 0) +
        (this.watchersStats.watchersAmountsPerCurrency[currency].totalLockedRSN ?? 0);
    });
  }
  private getValue(
    map: Record<ChainType, number | undefined>,
    chainType: ChainType,
    multiplier: number,
  ): number {
    return (map[chainType] ?? 0) * multiplier;
  }

  setLockedAmounts(chainType: ChainType): void {
    this.watchersStats.chainLockedRSN[chainType] =
      this.getValue(this.watchersStats.chainPermitCount, chainType, rs_PermitCost) +
      this.getValue(this.watchersStats.chainWatcherCount, chainType, rs_WatcherCollateralRSN);

    this.watchersStats.chainLockedERG[chainType] = this.getValue(
      this.watchersStats.chainWatcherCount,
      chainType,
      rs_WatcherCollateralERG,
    );

    Object.values(ChainType).forEach((c) => {
      this.watchersStats.activePermitCount[c] =
        (this.watchersStats.bulkPermitCount[c] ?? 0) +
        (this.watchersStats.triggerPermitCount[c] ?? 0);
    });

    this.watchersStats.totalWatcherCount = this.updateTotal(this.watchersStats.chainWatcherCount);
    this.watchersStats.totalPermitCount = this.updateTotal(this.watchersStats.chainPermitCount);
    this.watchersStats.totalActivePermitCount = this.updateTotal(
      this.watchersStats.activePermitCount,
    );
    this.watchersStats.totalLockedRSN = this.updateTotal(this.watchersStats.chainLockedRSN);
    this.watchersStats.totalLockedERG = this.updateTotal(this.watchersStats.chainLockedERG);

    this.currencyUpdate();
  }

  currencyUpdate(): void {
    Object.values(Currency).forEach((currency) => {
      this.watchersStats.watchersAmountsPerCurrency[currency].watcherValue = 0;
      this.watchersStats.watchersAmountsPerCurrency[currency].permitValue = 0;
    });

    this.convertCurrencies();
    this.updateTotalLocked();

    Object.values(Currency).forEach((currency) => {
      this.watchersStats.watchersAmountsPerCurrency[currency].watcherValue =
        (this.watchersStats.watchersAmountsPerCurrency[currency].rsnCollateral ?? 0) +
        (this.watchersStats.watchersAmountsPerCurrency[currency].ergCollateral ?? 0);
    });

    const newStats = JSON.stringify(this.watchersStats);
    if (JSON.stringify(this.watchersStatsSignal()) !== newStats) {
      console.log('Settings watchers stats signal');
      this.watchersStatsSignal.set(JSON.parse(newStats));
    }
  }

  private downloadPermitInfo(address: string, tokenId: string | null, tokenName: string | null) {
    const permitsUrl = `https://${rs_ErgoExplorerHost}/api/v1/addresses/${address}/balance/confirmed`;

    return this.downloadService
      .downloadStream<WatcherInfo>(permitsUrl)
      .pipe(
        map((data: { tokens: Token[] }) => {
          if (data.tokens) {
            const tokenData = data.tokens.find(
              (token: Token) =>
                (tokenId && token.tokenId === tokenId) || (tokenName && token.name === tokenName),
            );
            console.log(permitsUrl);
            if (tokenData) {
              tokenData.amount /= rs_PermitCost * Math.pow(10, tokenData.decimals);
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
              (tokenId && token.tokenId === tokenId) || (tokenName && token.name === tokenName),
          );
        }),
      );
  }

  getTriggerPermitsInfo(chainType: ChainType): Observable<Token | undefined> {
    const address = permitTriggerAddresses[chainType];
    return this.downloadPermitInfo(address, null, 'rspv2' + chainType + 'RWT');
  }

  getBulkPermitsInfo(chainType: ChainType): Observable<Token | undefined> {
    const address = permitBulkAddresses[chainType];
    return this.downloadPermitInfo(address, null, 'rspv2' + chainType + 'RWT');
  }

  download() {
    Object.values(ChainType).forEach((c) => {
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
          Object.values(ChainType).forEach((c) => {
            const amount =
              watcherInfo.tokens.find((token: Token) => token.name === 'rspv2' + c + 'AWC')
                ?.amount ?? 0;
            this.watchersStats.chainWatcherCount[c] = amount;
            this.setLockedAmounts(c);
          });
        }),
      )
      .subscribe();

    Object.values(ChainType).forEach((c) => {
      this.getPermitsInfo(c)
        .pipe(map((permitsInfo) => permitsInfo?.amount))
        .subscribe((amount) => {
          this.watchersStats.chainPermitCount[c] = amount;
          this.setLockedAmounts(c);
        });
    });
  }
}
