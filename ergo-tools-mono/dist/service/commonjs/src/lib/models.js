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
})(EventType || (exports.EventType = EventType = {}));
class Address {
    address;
    Address;
    active = true;
    chainType;
    smallAddressForDisplay;
    largeAddressForDisplay;
    ownAddress;
    constructor(address, chainType, active = true, ownAddress = false) {
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
    amount;
    name;
    decimals;
    type;
    tokenId;
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
    outputAddress;
    inputDate;
    boxId;
    assets;
    outputCreatedAt;
    address;
    accumulatedAmount;
    amount;
    chainType;
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
    tokenId;
    amount;
    decimals;
    name;
    tokenType;
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
    tokens;
    constructor(tokens) {
        this.tokens = tokens;
    }
}
exports.WatcherInfo = WatcherInfo;
class MyWatchersStats {
    activePermitCount;
    permitCount;
    wid;
    chainType;
    address;
}
exports.MyWatchersStats = MyWatchersStats;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class WatcherPerformanceAddressStat {
    address;
    reports;
}
exports.WatcherPerformanceAddressStat = WatcherPerformanceAddressStat;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class WatchersPerformanceStats {
    watcherPerformances;
}
exports.WatchersPerformanceStats = WatchersPerformanceStats;
class ChartDataSet {
    label;
    data;
    backgroundColor;
    pointBackgroundColor;
    borderColor;
    borderWidth;
    borderSkipped;
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
    label;
    data;
    backgroundColor;
    pointBackgroundColor;
    borderColor;
    borderWidth;
    borderSkipped;
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
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.ChartPoint = ChartPoint;
class ChartPerformance {
    address;
    addressForDisplay;
    chart;
    chainType;
    color;
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
    address;
    addressForDisplay;
    chart;
    chainType;
    color;
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
class WatchersAmounts {
    ergCollateral;
    permitValue;
    rsnCollateral;
    totalLocked;
    totalLockedERG;
    totalLockedRSN;
    watcherValue;
}
exports.WatchersAmounts = WatchersAmounts;
class WatchersStats {
    activePermitCount = createChainNumber();
    bulkPermitCount = createChainNumber();
    chainLockedERG = createChainNumber();
    chainLockedRSN = createChainNumber();
    chainPermitCount = createChainNumber();
    chainWatcherCount = createChainNumber();
    permitCost = constants_1.rs_PermitCost;
    totalActivePermitCount;
    totalLockedERG;
    totalLockedRSN;
    totalPermitCount;
    totalWatcherCount;
    triggerPermitCount = createChainNumber();
    watcherCollateralERG = (0, constants_1.rs_WatcherCollateralERG)('Ergo');
    watcherCollateralRSN = (0, constants_1.rs_WatcherCollateralRSN)('Ergo');
    watchersAmountsPerCurrency = Object.fromEntries(Object.values(constants_1.Currency).map((currency) => [
        currency,
        new WatchersAmounts(),
    ]));
}
exports.WatchersStats = WatchersStats;
