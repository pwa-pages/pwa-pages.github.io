import { getChainTypes } from "./chain.service";
import { rs_PermitCost, rs_WatcherCollateralERG, rs_WatcherCollateralRSN, Currency } from "./constants";
export var EventType;
(function (EventType) {
    EventType["StartFullDownload"] = "StartFullDownload";
    EventType["EndFullDownload"] = "EndFullDownload";
    EventType["RefreshInputs"] = "RefreshInputs";
    EventType["InputsChanged"] = "InputsChanged";
    EventType["PerfChartChanged"] = "PerfChartChanged";
    EventType["SwipeActivated"] = "SwipeActivated";
    EventType["SwipeDeActivated"] = "SwipeDeActivated";
    EventType["SwipeVertical"] = "SwipeVertical";
    EventType["StatisticsScreenLoaded"] = "StatisticsScreenLoaded";
    EventType["MyWatchersScreenLoaded"] = "MyWatchersScreenLoaded";
    EventType["ReportsRequested"] = "ReportsRequested";
    EventType["RequestInputsDownload"] = "RequestInputsDownload";
    EventType["WatchersScreenLoaded"] = "WatchersScreenLoaded";
    EventType["SettingsScreenLoaded"] = "SettingsScreenLoaded";
    EventType["PerformanceScreenLoaded"] = "PerformanceScreenLoaded";
    EventType["AddressChartChanged"] = "AddressChartChanged";
    EventType["WindowResized"] = "WindowResized";
    EventType["VersionUpdated"] = "VersionUpdated";
    EventType["WatchersStatsChanged"] = "WatchersStatsChanged";
    EventType["PermitsStatsChanged"] = "PermitsStatsChanged";
    EventType["ChainPerformanceChartsChanged"] = "ChainPerformanceChartsChanged";
    EventType["PerformanceChartsChanged"] = "PerformanceChartsChanged";
    EventType["StatisticsChartChanged"] = "StatisticsChartChanged";
    EventType["PermitsChanged"] = "PermitsChanged";
    EventType["RefreshPermits"] = "RefreshPermits";
    EventType["AddressPermitsDownloaded"] = "AddressPermitsDownloaded";
    EventType["ReportsChanged"] = "ReportsChanged";
})(EventType || (EventType = {}));
export class Address {
    constructor(address, chainType, active = true, ownAddress = false) {
        this.active = true;
        this.address = address;
        this.Address = address;
        this.smallAddressForDisplay = address.substring(0, 6) + '...';
        this.largeAddressForDisplay =
            address.substring(0, 6) +
                '...' +
                address.substring(address.length - 6, address.length);
        this.chainType = chainType;
        this.active = active;
        this.ownAddress = ownAddress;
    }
}
export class Asset {
    constructor(amount, name, decimals, type, tokenId) {
        this.amount = amount;
        this.name = name;
        this.decimals = decimals;
        this.type = type;
        this.tokenId = tokenId;
    }
}
export class Input {
    constructor(inputDate, address, outputCreatedAt, assets, outputAddress, boxId, accumulatedAmount, amount, chainType) {
        this.outputAddress = outputAddress;
        this.inputDate = inputDate;
        this.assets = assets;
        this.boxId = boxId;
        this.outputCreatedAt = outputCreatedAt;
        this.address = address;
        this.accumulatedAmount = accumulatedAmount;
        this.amount = amount;
        this.chainType = chainType;
    }
}
export class Token {
    constructor(tokenId, amount, decimals, name, tokenType) {
        this.tokenId = tokenId;
        this.amount = amount;
        this.decimals = decimals;
        this.name = name;
        this.tokenType = tokenType;
    }
}
export class WatcherInfo {
    constructor(tokens) {
        this.tokens = tokens;
    }
}
export class MyWatchersStats {
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class WatcherPerformanceAddressStat {
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class WatchersPerformanceStats {
}
export class ChartDataSet {
    constructor(chartColor) {
        this.label = '';
        this.data = [];
        this.backgroundColor = chartColor;
        this.pointBackgroundColor = chartColor;
        this.borderColor = chartColor;
        this.borderWidth = 0;
        this.borderSkipped = false;
    }
}
export class ChainPerfChartDataSet {
    constructor(chartColor) {
        this.label = '';
        this.data = [];
        this.backgroundColor = chartColor;
        this.pointBackgroundColor = chartColor;
        this.borderColor = chartColor;
        this.borderWidth = 0;
        this.borderSkipped = false;
    }
}
export class ChartPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
export class ChartPerformance {
    constructor(address, addressForDisplay, chart, color, chainType) {
        this.address = address;
        this.addressForDisplay = addressForDisplay;
        this.chart = chart;
        this.chainType = chainType;
        this.color = color;
    }
}
export class ChainChartPerformance {
    constructor(address, addressForDisplay, chart, color, chainType) {
        this.address = address;
        this.addressForDisplay = addressForDisplay;
        this.chart = chart;
        this.chainType = chainType;
        this.color = color;
    }
}
export function createChainNumber() {
    return Object.fromEntries(getChainTypes().map((key) => [key, undefined]));
}
export class WatchersAmounts {
}
export class WatchersStats {
    constructor() {
        this.activePermitCount = createChainNumber();
        this.bulkPermitCount = createChainNumber();
        this.chainLockedERG = createChainNumber();
        this.chainLockedRSN = createChainNumber();
        this.chainPermitCount = createChainNumber();
        this.chainWatcherCount = createChainNumber();
        this.permitCost = rs_PermitCost;
        this.triggerPermitCount = createChainNumber();
        this.watcherCollateralERG = rs_WatcherCollateralERG('Ergo');
        this.watcherCollateralRSN = rs_WatcherCollateralRSN('Ergo');
        this.watchersAmountsPerCurrency = Object.fromEntries(Object.values(Currency).map((currency) => [
            currency,
            new WatchersAmounts(),
        ]));
    }
}
//# sourceMappingURL=models.js.map