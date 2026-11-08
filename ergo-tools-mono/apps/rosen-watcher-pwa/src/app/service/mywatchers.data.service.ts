import { Injectable } from '@angular/core';
import {
  EventType,
  getActiveChainTypes,
  getChainTypes,
  MyWatchersStats,
  rs_PermitCost,
  rs_WatcherCollateralRSN,
} from '@ergo-tools/service';
import { EventService } from './event.service';
import { Address } from '@ergo-tools/service';

interface PermitInfo {
  lockedRSN: number;
  activeLockedRSN: number;
  address: string;
  wid: string;
  chainType: string;
}

@Injectable({
  providedIn: 'root',
})
export class MyWatchersDataService {
  isChainTypeActive(chainType: string): boolean {
    return (getActiveChainTypes() as string[]).includes(chainType);
  }

  readonly rsnToken =
    '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';
  readonly myWatcherStats: MyWatchersStats[] = [];

  busyCounter = 0;

  constructor(
    private eventService: EventService,
  ) {
    this.eventService.subscribeToEvent(
      EventType.PermitsChanged,
      (permits: PermitInfo[]) => {
        this.myWatcherStats.length = 0;

        let myWatcherStats: MyWatchersStats[] = [];
        permits.forEach((permit: PermitInfo) => {
          let permitCount = Math.floor(
            (permit.lockedRSN - rs_WatcherCollateralRSN(permit.chainType)) / rs_PermitCost,
          );
          let activepermitCount = Math.floor(
            permit.activeLockedRSN / rs_PermitCost,
          );

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

        let entries = getChainTypes();

        entries.forEach((chainType) => {
          const stats = myWatcherStats.filter(
            (ws) => ws.chainType === chainType,
          );
          stats.forEach((stat) => {
            this.myWatcherStats.push(stat);
          });
        });

        localStorage.setItem(
          'myWatcherStats',
          JSON.stringify(this.myWatcherStats),
        );

        this.eventService.sendEvent(EventType.RefreshPermits);
      },
    );
  }


  async getMyWatcherStats(addresses: string[]): Promise<MyWatchersStats[]> {
    if (this.myWatcherStats.length == 0) {
      const storedStats = localStorage.getItem('myWatcherStats');
      if (storedStats) {
        this.myWatcherStats.push(...JSON.parse(storedStats));
      }
    }

    return this.myWatcherStats.filter((w) =>
      addresses.some((a) => a === w.address?.address),
    );
  }
}
