"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadStatusService = void 0;
const constants_1 = require("./constants");
class DownloadStatusService {
    constructor(dataService, db) {
        this.dataService = dataService;
        this.db = db;
    }
    async getDownloadStatus(address) {
        const status = await this.db.getDataById(constants_1.rs_DownloadStatusStoreName, `${address}_${this.dataService.getDataType()}`);
        return status;
    }
    async setDownloadStatus(address, status) {
        const key = `${address}_${this.dataService.getDataType()}`;
        const dbStatus = (await this.getDownloadStatus(address)) ?? {
            address: key,
            Address: address,
            status,
            lastDownloadDate: undefined,
        };
        dbStatus.address = key;
        dbStatus.Address = address;
        dbStatus.status = status;
        await this.saveDownloadStatus(dbStatus);
    }
    async saveDownloadStatus(downloadStatus) {
        await this.db.addData(constants_1.rs_DownloadStatusStoreName, [downloadStatus], downloadStatus.address);
    }
}
exports.DownloadStatusService = DownloadStatusService;
//# sourceMappingURL=download.status.service.js.map