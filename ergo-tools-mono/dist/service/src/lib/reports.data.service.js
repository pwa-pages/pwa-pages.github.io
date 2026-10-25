"use strict";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ReportsDataService extends PermitsDataService {
    constructor(db, eventSender, storeName = rs_ReportsStoreName, maxDownloadDateDifference = 204800000) {
        super(db, storeName, maxDownloadDateDifference);
        this.eventSender = eventSender;
    }
    getDataType() {
        return 'report';
    }
    async purgeData() {
    }
    async getWatcherPerformanceByChainType() {
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
    async getAdressPermitsByChainType(chainType, activeOnly, startMonth, startYear, endMonth, endYear) {
        var permits = await super.getAdressPermits(activeOnly, startMonth, startYear, endMonth, endYear);
        permits = permits.filter((tx) => !Object.values(permitTriggerAddresses).includes(tx.address));
        permits = permits.filter((tx) => tx.chainType === chainType);
        return permits;
    }
    async addData(address, transactions) {
        await super.addData(address, transactions);
        var chainType = getChainTypeForPermitTriggerAddress(address);
        if (chainType === undefined || chainType === null) {
            return;
        }
        var performances = await this.getWatcherPerformanceByChainType();
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
globalThis.GetWatcherDataService = (permitsDataService) => {
    return new WatcherDataService(permitsDataService);
};
//# sourceMappingURL=reports.data.service.js.map