import { Injectable, Signal, signal } from '@angular/core';
import {
  WatchersPerformanceStats,
  WatcherPerformanceAddressStat,
  Address,
  PermitTx
} from '@ergo-tools/service';
import { ChainTypeHelper } from '../imports/imports';
import { EventService, EventType } from './event.service';


@Injectable({
  providedIn: 'root',
})
export class WatchersPerformanceDataService {
  selectedMonth: string = '';
  isChainTypeActive(chainType: string): boolean {
    return ChainTypeHelper.isChainTypeActive(chainType);
  }

  readonly rsnToken =
    '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';
  watchersPerformanceStats = signal<WatchersPerformanceStats>(new WatchersPerformanceStats());

  busyCounter = 0;

  constructor(private eventService: EventService
  ) {
    this.eventService.subscribeToEvent(
      EventType.ReportsChanged,
      (permits: PermitTx[]) => {
        this.updateWatchersPerformanceStats(permits);
      }
    );

  }

  private updateWatchersPerformanceStats(permits: PermitTx[]): void {
    const reportCountsByChainType: Record<string, Record<string, number>> = {};

    permits.forEach((permit: PermitTx) => {
      if (!permit.chainType || !permit.address) {
        return;
      }

      if (this.selectedMonth && permit.date.getMonth() !== new Date(`${this.selectedMonth} 1, 2000`).getMonth()) {
        return;
      }

      const addressCounts =
        reportCountsByChainType[permit.chainType] ??
        (reportCountsByChainType[permit.chainType] = {});

      addressCounts[permit.address] = (addressCounts[permit.address] ?? 0) + 1;
    });

    const watcherPerformanceByChainType: Record<string, WatcherPerformanceAddressStat[]> = {};

    Object.entries(reportCountsByChainType).forEach(([chainType, addressCounts]) => {
      watcherPerformanceByChainType[chainType] = Object.entries(addressCounts)
        .map(([address, reports]) => ({
          address: new Address(address, chainType),
          reports,
        }))
        .sort((a, b) => b.reports - a.reports);
    });

    const stats = new WatchersPerformanceStats();



    stats.watcherPerformanceByChainType = watcherPerformanceByChainType;


    this.watchersPerformanceStats.set(stats);
  }

  public async getWatchersPerformanceStats(selectedMonth: string): Promise<Signal<WatchersPerformanceStats>> {
    this.selectedMonth = selectedMonth;
    return this.watchersPerformanceStats;
  }
}
