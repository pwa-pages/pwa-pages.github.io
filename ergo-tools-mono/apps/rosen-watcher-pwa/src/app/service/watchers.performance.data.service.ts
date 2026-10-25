import { Injectable, signal } from '@angular/core';
import {
  Address,
  WatchersPerformanceStats
} from '@ergo-tools/service';
import { ChainTypeHelper } from '../imports/imports';
import { ChainDataService } from './chain.data.service';
import { EventService, EventType } from './event.service';


@Injectable({
  providedIn: 'root',
})
export class WatchersPerformanceDataService {
  selectedMonth: string = '';
  isChainTypeActive(chainType: string): boolean {
    return ChainTypeHelper.isChainTypeActive(chainType);
  }

  private readonly _watcherPerformanceStats =
    signal<WatchersPerformanceStats | undefined>(undefined);
  readonly watcherPerformanceStats = this._watcherPerformanceStats.asReadonly();
  readonly rsnToken =
    '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';


  busyCounter = 0;

  constructor(private chainDataService: ChainDataService, eventService: EventService) {

    eventService.subscribeToEvent(
      EventType.ReportsChanged,
      async (performanceStats: WatchersPerformanceStats) => {
        const enrichedStats = await this.enrichWatchersPerformanceStats(performanceStats);
        enrichedStats.watcherPerformances = performanceStats.watcherPerformances;
        this._watcherPerformanceStats.set(enrichedStats);
      }
    );

  }

  public async enrichWatchersPerformanceStats(watchersPerformanceStats: WatchersPerformanceStats): Promise<WatchersPerformanceStats> {

    for (const performanceByPeriod of Object.values(watchersPerformanceStats.watcherPerformances ?? {})) {
      for (const addressStats of Object.values(performanceByPeriod)) {
        for (const addressStat of addressStats) {

          const originalAddress = addressStat.address;
          if (originalAddress?.address === undefined) {
            continue;
          }
          addressStat.address = new Address(originalAddress.address, originalAddress.chainType, originalAddress.active, originalAddress.ownAddress);

          const address = addressStat.address;
          if (address === undefined) {
            continue;
          }

          if ((await this.chainDataService.getAddresses()).some(addr => addr === address.address)) {
            address.ownAddress = true;
          }
        }
      }
    }

    return watchersPerformanceStats;
  }
}