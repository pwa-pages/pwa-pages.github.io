"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsDataService = void 0;
const chain_service_1 = require("./chain.service");
const constants_1 = require("./constants");
const permits_data_service_1 = require("./permits.data.service");
const watcher_data_service_1 = require("./watcher.data.service");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ReportsDataService extends permits_data_service_1.PermitsDataService {
    eventSender;
    constructor(db, eventSender, storeName = constants_1.rs_ReportsStoreName, maxDownloadDateDifference = 204800000) {
        super(db, storeName, maxDownloadDateDifference);
        this.eventSender = eventSender;
    }
    getDataType() {
        return 'report';
    }
    async purgeData() {
    }
    async getWatcherPerformanceByChainTypeFromReports() {
        const permits = await super.getAdressPermits(false, null, null, null, null);
        const reportCountsByChainTypeAndMonth = {};
        permits.forEach((permit) => {
            if (!permit.chainType || !permit.address || Number.isNaN(permit.date.getTime())) {
                return;
            }
            const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(permit.date);
            const monthCounts = reportCountsByChainTypeAndMonth[permit.chainType] ??
                (reportCountsByChainTypeAndMonth[permit.chainType] = {});
            const addressCounts = monthCounts[month] ?? (monthCounts[month] = {});
            addressCounts[permit.address] = (addressCounts[permit.address] ?? 0) + 1;
        });
        const watcherPerformanceByChainType = {};
        Object.entries(reportCountsByChainTypeAndMonth).forEach(([chain, monthCounts]) => {
            watcherPerformanceByChainType[chain] = {};
            Object.entries(monthCounts).forEach(([month, addressCounts]) => {
                const addressStats = Object.entries(addressCounts)
                    .map(([address, reports]) => ({
                    address: {
                        address,
                        chainType: chain
                    },
                    reports
                }))
                    .sort((a, b) => b.reports - a.reports);
                if (addressStats.length > 0) {
                    watcherPerformanceByChainType[chain][month] = addressStats;
                }
            });
        });
        const watcherPerformanceStats = {
            watcherPerformances: watcherPerformanceByChainType
        };
        return watcherPerformanceStats;
    }
    async getWatcherPerformanceByChainType() {
        const chainTypes = Object.values(chain_service_1.ChainType);
        const watcherPerformances = {};
        for (const chainType of chainTypes) {
            const result = await this.storageService.getData(constants_1.rs_WatcherReportsStoreName, chainType);
            const monthStats = (Array.isArray(result) ? result[0] : result);
            if (monthStats) {
                watcherPerformances[chainType] = monthStats;
            }
        }
        const watcherPerformanceStats = {
            watcherPerformances
        };
        return watcherPerformanceStats;
    }
    async getAdressPermitsByChainType(chainType, activeOnly, startMonth, startYear, endMonth, endYear) {
        var permits = await super.getAdressPermits(activeOnly, startMonth, startYear, endMonth, endYear);
        permits = permits.filter((tx) => !Object.values(chain_service_1.permitTriggerAddresses).includes(tx.address));
        permits = permits.filter((tx) => tx.chainType === chainType);
        return permits;
    }
    async addData(address, transactions) {
        await super.addData(address, transactions);
        var chainType = (0, chain_service_1.getChainTypeForPermitTriggerAddress)(address);
        if (chainType === undefined || chainType === null) {
            return;
        }
        var performances = await this.getWatcherPerformanceByChainTypeFromReports();
        const watcherPerformances = performances.watcherPerformances ?? {};
        Object.keys(watcherPerformances).forEach((c) => {
            const monthStats = watcherPerformances[c];
            this.storageService.addData(constants_1.rs_WatcherReportsStoreName, [monthStats], c);
        });
        await this.eventSender?.sendEvent({
            type: 'ReportsChanged',
            data: performances,
        });
    }
    getMaxDownloadDateDifference() {
        const now = new Date();
        const firstOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return now.getTime() - firstOfPreviousMonth.getTime() + 2 * 24 * 60 * 60 * 1000;
    }
}
exports.ReportsDataService = ReportsDataService;
globalThis.GetWatcherDataService = (permitsDataService) => {
    return new watcher_data_service_1.WatcherDataService(permitsDataService);
};
