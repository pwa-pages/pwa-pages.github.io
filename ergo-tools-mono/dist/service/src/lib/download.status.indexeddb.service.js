"use strict";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DownloadStatusIndexedDbService {
    //private static addressDownloadDateMap = new Map<string, Date>();
    constructor(dataService, db) {
        this.dataService = dataService;
        this.db = db;
    }
    // Get Download Status for Address from IndexedDB
    async getDownloadStatus(address) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([rs_DownloadStatusStoreName], 'readonly');
            const objectStore = transaction.objectStore(rs_DownloadStatusStoreName);
            const request = objectStore.get(address + '_' + this.dataService.getDataType());
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
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
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([rs_DownloadStatusStoreName], 'readwrite');
            const objectStore = transaction.objectStore(rs_DownloadStatusStoreName);
            const request = objectStore.put(downloadStatus);
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }
}
//# sourceMappingURL=download.status.indexeddb.service.js.map