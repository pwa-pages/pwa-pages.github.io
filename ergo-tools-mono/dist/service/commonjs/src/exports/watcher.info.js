"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyWatchersStats = exports.WatcherInfo = void 0;
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
