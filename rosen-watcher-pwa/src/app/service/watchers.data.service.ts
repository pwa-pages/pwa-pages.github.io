import { Injectable, Signal, signal } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpDownloadService } from './http.download.service';
import { Observable } from 'rxjs';
import { MyWatchersStats, WatcherInfo } from '../../service/ts/models/watcher.info';
import { Token } from '../../service/ts/models/token';
import { PriceService } from './price.service';
import { WatchersStats } from './watchers.models';
import { EventService, EventType } from './event.service';
import { Address } from '../../service/ts/models/address';

@Injectable({
  providedIn: 'root',
})
export class WatchersDataService {
  isChainTypeActive(chainType: ChainType): boolean {
    return rewardAddresses[chainType] !== null;
  }
  readonly watcherUrl =
    'https://' +
    rs_ErgoExplorerHost +
    '/api/v1/addresses/ChTbcUHgBNqNMVjzV1dvCb2UDrX9nh6rGGcURCFEYXuH5ykKh7Ea3FvpFhHb9AnxXJkgAZ6WASN7Rdn7VMgkFaqP5Z5RWp84cDTmsZkhYrgAVGN7mjeLs8UxqUvRi2ArZbm35Xqk8Y88Uq2MJzmDVHLHzCYRGym8XPxFM4YEVxqzHSKYYDvaMLgKvoskFXKrvceAqEiyih26hjpekCmefiF1VmrPwwShrYYxgHLFCZdigw5JWKV4DmewuR1FH3oNtGoFok859SXeuRbpQfrTjHhGVfDsbXEo3GYP2imAh1APKyLEsG9LcE5WZnJV8eseQnYA8sACLDKZ8Tbpp9KUE7QZNFpnwGnkYx7eybbrCeFDFjTGpsBzaS6fRKrWj2J4Wy3TTyTU1F8iMCrHBF8inZPw9Kg9YEZuJMdXDFNtuaK15u86mF2s2Z5B1vdL5MtZfWThFLnixKds8ABEmGbe8n75Dym5Wv3pkEXQ6XPpaMjUxHfRJB3EfcoFM5nsZHWSTfbFBcHxSRnEiiU67cgJsBUpQn7FvEvqNLiKM4fL3yyykMtQ6RjAS8rhycszphvQa5qFrDHie4vPuTq8/balance/confirmed';

  readonly rsnToken = '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';
  readonly watchersStatsSignal = signal<WatchersStats>(new WatchersStats());
  readonly watchersStats = new WatchersStats();
  readonly myWatcherStats: MyWatchersStats[] = [];

  busyCounter = 0;

  constructor(
    private downloadService: HttpDownloadService,
    private priceService: PriceService,
    private eventService: EventService,
  ) {
    this.eventService.subscribeToEvent(EventType.PermitsChanged, (permits: PermitInfo[]) => {
      this.myWatcherStats.length = 0;

      let myWatcherStats: MyWatchersStats[] = [];
      permits.forEach((permit: PermitInfo) => {
        let permitCount = Math.floor((permit.lockedRSN - rs_WatcherCollateralRSN) / rs_PermitCost);
        let activepermitCount = Math.floor(permit.activeLockedRSN / rs_PermitCost);

        if (permitCount < 0) {
          permitCount = 0;
        }

        if (permit.address) {
          myWatcherStats.push({
            activePermitCount: activepermitCount,
            permitCount: permitCount,
            wid: permit.wid,
            chainType: permit.chainType,
            address: new Address(permit.address, permit.chainType),
          });
        }
      });

      let entries = Object.values(ChainType);

      entries.forEach((chainType) => {
        const stats = myWatcherStats.filter((ws) => ws.chainType === chainType);
        stats.forEach((stat) => {
          this.myWatcherStats.push(stat);
        });
      });

      localStorage.setItem('myWatcherStats', JSON.stringify(this.myWatcherStats));

      this.eventService.sendEvent(EventType.RefreshPermits);
    });
  }

  getWatcherStats(): Signal<WatchersStats> {
    return this.watchersStatsSignal;
  }

  async requestAddressPermits(
    processedChainTypes: Partial<Record<ChainType, boolean>>,
    addresses: Address[],
  ) {
    let myWatcherStats = await this.getMyWatcherStats(addresses);
    for (const stat of myWatcherStats) {
      if (stat.chainType && !processedChainTypes[stat.chainType]) {
        console.log('Chaintype not processed ' + stat.chainType);

        await this.eventService.sendEventWithData(EventType.RequestAddressPermits, {
          myWatcherStats: myWatcherStats,
          chainType: stat.chainType,
        });
        console.log('Chaintype processed ' + stat.chainType);
        processedChainTypes[stat.chainType] = true;
      }
    }

    return processedChainTypes;
  }

  async getMyWatcherStats(addresses: Address[]): Promise<MyWatchersStats[]> {
    if (this.myWatcherStats.length == 0) {
      const storedStats = localStorage.getItem('myWatcherStats');
      if (storedStats) {
        this.myWatcherStats.push(...JSON.parse(storedStats));
      }
    }

    return this.myWatcherStats.filter((w) =>
      addresses.some((a) => a.address === w.address?.address),
    );
  }

  getWatchersInfo(): Observable<WatcherInfo> {
    const result = this.downloadService.downloadStream<WatcherInfo>(this.watcherUrl);

    return result;
  }

  getPermitsInfo(chainType: ChainType): Observable<Token | undefined> {
    const address = permitAddresses[chainType];
    if (address === null) {
      return new Observable<Token | undefined>((subscriber) => {
        subscriber.next(undefined);
        subscriber.complete();
      });
    }
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
    if (address === null) {
      return new Observable<Token | undefined>((subscriber) => {
        subscriber.next(undefined);
        subscriber.complete();
      });
    }

    return this.downloadPermitInfo(address, null, chainTypeTokens[chainType]);
  }

  getBulkPermitsInfo(chainType: ChainType): Observable<Token | undefined> {
    const address = permitBulkAddresses[chainType];

    if (address === null) {
      return new Observable<Token | undefined>((subscriber) => {
        subscriber.next(undefined);
        subscriber.complete();
      });
    }

    return this.downloadPermitInfo(address, null, chainTypeTokens[chainType]);
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
              watcherInfo.tokens.find(
                (token: Token) => token.name === chainTypeWatcherIdentifier[c],
              )?.amount ?? 0;
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
