"use strict";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DataService {
    constructor(db) {
        this.db = db;
        this.storageService = new StorageService(db);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async purgeData() {
        // Empty implementation
    }
    getMaxDownloadDateDifference() {
        return 3155760000000;
    }
}
//# sourceMappingURL=data.service.js.map