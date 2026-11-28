"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchersStats = exports.WatchersAmounts = exports.ChainChartPerformance = exports.ChartPerformance = exports.ChartPoint = exports.ChainPerfChartDataSet = exports.ChartDataSet = exports.WatchersPerformanceStats = exports.WatcherPerformanceAddressStat = exports.MyWatchersStats = exports.WatcherInfo = exports.Token = exports.Input = exports.Asset = exports.Address = exports.EventType = void 0;
exports.createChainNumber = createChainNumber;
const chain_service_1 = require("./chain.service");
const constants_1 = require("./constants");
var EventType;
(function (EventType) {
    EventType["StartFullDownload"] = "StartFullDownload";
    EventType["EndFullDownload"] = "EndFullDownload";
    EventType["RefreshInputs"] = "RefreshInputs";
    EventType["InputsChanged"] = "InputsChanged";
    EventType["ChainPerfChartChanged"] = "PerfChartChanged";
    EventType["SwipeActivated"] = "SwipeActivated";
    EventType["SwipeDeActivated"] = "SwipeDeActivated";
    EventType["SwipeVertical"] = "SwipeVertical";
    EventType["StatisticsRequested"] = "StatisticsRequested";
    EventType["MyWatcherStatsRequested"] = "MyWatcherStatsRequested";
    EventType["ReportsRequested"] = "ReportsRequested";
    EventType["RequestInputsDownload"] = "RequestInputsDownload";
    EventType["WatcherStatsRequested"] = "WatcherStatsRequested";
    EventType["SettingsScreenLoaded"] = "SettingsScreenLoaded";
    EventType["ChainPerformanceRequested"] = "ChainPerformanceRequested";
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
    EventType["ALLReportsDataAvailable"] = "ALLReportsDataAvailable";
    EventType["MyWatcherStatsRequestFinished"] = "MyWatcherStatsRequestFinished";
})(EventType || (exports.EventType = EventType = {}));
class Address {
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
exports.Address = Address;
class Asset {
    constructor(amount, name, decimals, type, tokenId) {
        this.amount = amount;
        this.name = name;
        this.decimals = decimals;
        this.type = type;
        this.tokenId = tokenId;
    }
}
exports.Asset = Asset;
class Input {
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
exports.Input = Input;
class Token {
    constructor(tokenId, amount, decimals, name, tokenType) {
        this.tokenId = tokenId;
        this.amount = amount;
        this.decimals = decimals;
        this.name = name;
        this.tokenType = tokenType;
    }
}
exports.Token = Token;
class WatcherInfo {
    constructor(tokens) {
        this.tokens = tokens;
    }
}
exports.WatcherInfo = WatcherInfo;
class MyWatchersStats {
}
exports.MyWatchersStats = MyWatchersStats;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class WatcherPerformanceAddressStat {
}
exports.WatcherPerformanceAddressStat = WatcherPerformanceAddressStat;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class WatchersPerformanceStats {
}
exports.WatchersPerformanceStats = WatchersPerformanceStats;
class ChartDataSet {
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
exports.ChartDataSet = ChartDataSet;
class ChainPerfChartDataSet {
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
exports.ChainPerfChartDataSet = ChainPerfChartDataSet;
class ChartPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.ChartPoint = ChartPoint;
class ChartPerformance {
    constructor(address, addressForDisplay, chart, color, chainType) {
        this.address = address;
        this.addressForDisplay = addressForDisplay;
        this.chart = chart;
        this.chainType = chainType;
        this.color = color;
    }
}
exports.ChartPerformance = ChartPerformance;
class ChainChartPerformance {
    constructor(address, addressForDisplay, chart, color, chainType) {
        this.address = address;
        this.addressForDisplay = addressForDisplay;
        this.chart = chart;
        this.chainType = chainType;
        this.color = color;
    }
}
exports.ChainChartPerformance = ChainChartPerformance;
function createChainNumber() {
    return Object.fromEntries((0, chain_service_1.getChainTypes)().map((key) => [key, undefined]));
}
function createChainNumberMap(getValue) {
    return Object.fromEntries((0, chain_service_1.getChainTypes)().map((chainType) => [chainType, getValue(chainType)]));
}
class WatchersAmounts {
}
exports.WatchersAmounts = WatchersAmounts;
class WatchersStats {
    constructor() {
        this.activePermitCount = createChainNumber();
        this.bulkPermitCount = createChainNumber();
        this.chainLockedERG = createChainNumber();
        this.chainLockedRSN = createChainNumber();
        this.chainPermitCount = createChainNumber();
        this.chainWatcherCount = createChainNumber();
        this.permitCost = createChainNumberMap((chainType) => (0, constants_1.getPermitCost)(chainType));
        this.triggerPermitCount = createChainNumber();
        this.watcherCollateralERG = createChainNumberMap(constants_1.rs_WatcherCollateralERG);
        this.watcherCollateralRSN = createChainNumberMap(constants_1.rs_WatcherCollateralRSN);
        this.watchersAmountsPerCurrency = Object.fromEntries(Object.values(constants_1.Currency).map((currency) => [
            currency,
            new WatchersAmounts(),
        ]));
    }
}
exports.WatchersStats = WatchersStats;
//# sourceMappingURL=models.js.map