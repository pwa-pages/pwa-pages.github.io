"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadStatusMemoryService = void 0;
const constants_1 = require("./constants");
class DownloadStatusMemoryService {
    dataService;
    db;
    //private static addressDownloadDateMap = new Map<string, Date>();
    constructor(dataService, db) {
        this.dataService = dataService;
        this.db = db;
    }
    // Get Download Status for Address from IndexedDB
    async getDownloadStatus(address) {
        const status = await this.db.getDataById(constants_1.rs_DownloadStatusStoreName, address + '_' + this.dataService.getDataType());
        return status;
    }
    // Set Download Status for Address in IndexedDB
    async setDownloadStatus(address, status) {
        let dbStatus = await this.getDownloadStatus(address);
        if (!dbStatus) {
            dbStatus = {
                address: address + '_' + this.dataService.getDataType(),
                Address: address,
                status: status,
                lastDownloadDate: undefined,
            };
        }
        else {
            dbStatus.status = status;
            dbStatus.address = address + '_' + this.dataService.getDataType();
            dbStatus.Address = address;
        }
        await this.saveDownloadStatus(dbStatus);
    }
    async saveDownloadStatus(downloadStatus) {
        await this.db.addData(constants_1.rs_DownloadStatusStoreName, [downloadStatus], downloadStatus.address);
    }
}
exports.DownloadStatusMemoryService = DownloadStatusMemoryService;
