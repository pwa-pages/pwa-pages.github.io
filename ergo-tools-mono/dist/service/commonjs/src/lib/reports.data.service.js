"use strict";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ReportsDataService extends PermitsDataService {
    constructor(db, storeName = rs_ActivePermitTxStoreName, maxDownloadDateDifference = 204800000) {
        super(db, storeName, maxDownloadDateDifference);
    }
    getDataType() {
        return 'report';
    }
    async purgeData() {
    }
    getMaxDownloadDateDifference() {
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return now.getTime() - firstOfMonth.getTime() + 2 * 24 * 60 * 60 * 1000;
    }
}
globalThis.GetWatcherDataService = (permitsDataService) => {
    return new WatcherDataService(permitsDataService);
};
