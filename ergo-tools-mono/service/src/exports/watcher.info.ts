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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class WatcherPerformanceAddressStat {
  address: Address | undefined;
  reports: number | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class WatchersPerformanceStats {
  watcherPerformances:
    | Record<string, Record<string, WatcherPerformanceAddressStat[]>>
    | undefined;
}

