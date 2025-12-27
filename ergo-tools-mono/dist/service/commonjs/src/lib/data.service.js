// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DataService {
    storageService;
    db;
    constructor(dbOrStorage) {
        if (dbOrStorage.transaction !== undefined) {
            this.db = dbOrStorage;
            this.storageService = new IDBDatabaseStorageService(this.db);
        }
        else {
            this.storageService = dbOrStorage;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async purgeData() {
        // Empty implementation
    }
    getMaxDownloadDateDifference() {
        return 3155760000000;
    }
}
