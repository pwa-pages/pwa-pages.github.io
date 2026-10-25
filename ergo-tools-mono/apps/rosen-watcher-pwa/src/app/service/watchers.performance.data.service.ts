import { Injectable } from '@angular/core';
import {
  WatchersPerformanceStats
} from '@ergo-tools/service';
import { ChainTypeHelper } from '../imports/imports';
import { ChainDataService } from './chain.data.service';


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
  

  busyCounter = 0;

        constructor(private chainDataService: ChainDataService 
  ) {
    

  }


  
  public async enrichWatchersPerformanceStats(watchersPerformanceStats: WatchersPerformanceStats): Promise<WatchersPerformanceStats> {

    for (const performanceByPeriod of Object.values(watchersPerformanceStats.watcherPerformances ?? {})) {
      for (const addressStats of Object.values(performanceByPeriod)) {
        for (const addressStat of addressStats) {
          const address = addressStat.address;
          if (address === undefined) {
            continue;
          }

          if( (await this.chainDataService.getAddresses()).some(addr => addr === address.address) ) {
            address.ownAddress = true;
          }
        }
      }
    }

    return watchersPerformanceStats;
  }
}