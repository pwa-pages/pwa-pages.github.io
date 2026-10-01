"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchersPerformanceStats = exports.WatcherPerformanceAddressStat = exports.MyWatchersStats = exports.WatcherInfo = void 0;
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
class WatcherPerformanceAddressStat {
    address;
    reports;
}
exports.WatcherPerformanceAddressStat = WatcherPerformanceAddressStat;
class WatchersPerformanceStats {
    watcherPerformanceByChainType;
}
exports.WatchersPerformanceStats = WatchersPerformanceStats;
