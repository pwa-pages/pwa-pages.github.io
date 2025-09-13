import { Address } from '../../service/ts/models/address';

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

export class MyWatchersStats {
  activePermitCount: number | undefined;
  permitCount: number | undefined;
  wid: string | undefined;
  chainType: ChainType | undefined;
  address: Address | undefined;
}
