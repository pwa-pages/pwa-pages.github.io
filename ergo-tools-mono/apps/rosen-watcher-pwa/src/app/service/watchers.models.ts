import { ChainTypeHelper } from "../imports/imports";

export function createChainNumber(): Record<string, number | undefined> {
  return Object.fromEntries(
    ChainTypeHelper.getAllChainTypes().map((key) => [key, undefined]),
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
  watcherCollateralERG = rs_WatcherCollateralERG;
  watcherCollateralRSN = rs_WatcherCollateralRSN;

  watchersAmountsPerCurrency: Record<string, WatchersAmounts> =
    Object.fromEntries(
      Object.values(Currency).map((currency) => [
        currency,
        new WatchersAmounts(),
      ]),
    ) as Record<string, WatchersAmounts>;
}
