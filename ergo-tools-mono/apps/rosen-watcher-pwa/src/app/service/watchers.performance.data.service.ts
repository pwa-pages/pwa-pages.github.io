import { Injectable } from '@angular/core';
import {
  WatchersPerformanceStats,
  WatcherPerformanceAddressStat,
  Address
} from '@ergo-tools/service';
import { ChainTypeHelper } from '../imports/imports';


@Injectable({
  providedIn: 'root',
})
export class WatchersPerformanceDataService {
  isChainTypeActive(chainType: string): boolean {
    return ChainTypeHelper.isChainTypeActive(chainType);
  }

  readonly rsnToken =
    '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';
  watchersPerformanceStats: WatchersPerformanceStats | null = null;

  busyCounter = 0;

  constructor(
  ) {

  }


  async getWatchersPerformanceStats(chainType: string): Promise<WatcherPerformanceAddressStat[]> {
    if (this.watchersPerformanceStats == null) {
      const storedStats = localStorage.getItem('watchersPerformanceStats');
      if (storedStats) {
        this.watchersPerformanceStats = JSON.parse(storedStats);
      }
    }
    //return this.watchersPerformanceStats?.watcherPerformanceByChainType?.[chainType] || [];

    const result: WatcherPerformanceAddressStat[] = [
      {
        address: new Address('9f8e7d6c5b4a3e2f1d0c9b8a7e6d5c4b3a2f1e0d', chainType),
        reports: 10
      },
      {
        address: new Address('1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t', chainType),
        reports : 22
      }
    ];
    return result;
  }

}
