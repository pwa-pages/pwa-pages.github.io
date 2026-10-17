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
        const permitTxs = (await this.getAdressPermitsByChainType(chainType.toString(), false, null, null, null, null));
        this.eventSender?.sendEvent({
            type: 'ReportsChanged',
            data: permitTxs,
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