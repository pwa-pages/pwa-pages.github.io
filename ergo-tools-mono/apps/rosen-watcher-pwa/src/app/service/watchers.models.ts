import { ErgSettings } from "@ergo-tools/service";
import { ChainTypeHelper, getCurrencies } from "../imports/imports";

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
  permitCost = ErgSettings.rs_PermitCost();
  totalActivePermitCount: number | undefined;
  totalLockedERG: number | undefined;
  totalLockedRSN: number | undefined;
  totalPermitCount: number | undefined;
  totalWatcherCount: number | undefined;
  triggerPermitCount = createChainNumber();
  watcherCollateralERG = ErgSettings.rs_WatcherCollateralERG();
  watcherCollateralRSN = ErgSettings.rs_WatcherCollateralRSN();

  watchersAmountsPerCurrency: Record<string, WatchersAmounts> =
    Object.fromEntries(
      getCurrencies().map((currency) => [
        currency,
        new WatchersAmounts(),
      ]),
    ) as Record<string, WatchersAmounts>;
}
