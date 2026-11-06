import { Currency, getChainTypes, rs_PermitCost, rs_WatcherCollateralERG, rs_WatcherCollateralRSN } from "@ergo-tools/service";


export function createChainNumber(): Record<string, number | undefined> {
  return Object.fromEntries(
    getChainTypes().map((key) => [key, undefined]),
  ) as Record<string, number | undefined>;
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
  watcherCollateralERG = rs_WatcherCollateralERG('Ergo');
  watcherCollateralRSN = rs_WatcherCollateralRSN('Ergo');

  watchersAmountsPerCurrency: Record<string, WatchersAmounts> =
    Object.fromEntries(
      Object.values(Currency).map((currency) => [
        currency,
        new WatchersAmounts(),
      ]),
    ) as Record<string, WatchersAmounts>;
}
