import { Address } from './address';
import type { Token } from './token';

export class WatcherInfo {
  constructor(public tokens: Token[]) {}
}

export class MyWatchersStats {
  activePermitCount: number | undefined;
  permitCount: number | undefined;
  wid: string | undefined;
  chainType: string | undefined;
  address: Address | undefined;
}

export class WatcherPerformanceAddressStat{
  address: Address | undefined;
  reports: number | undefined;
}

export class WatchersPerformanceStats {
  watcherPerformanceByChainType: Record<string, WatcherPerformanceAddressStat[]> | undefined;
}

