"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = void 0;
const i_db_databasestorage_service_1 = require("./i-db-databasestorage.service");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DataService {
    storageService;
    db;
    constructor(dbOrStorage) {
        if (dbOrStorage?.transaction !== undefined) {
            this.db = dbOrStorage;
            this.storageService = new i_db_databasestorage_service_1.IDBDatabaseStorageService(this.db);
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
exports.DataService = DataService;
