"use strict";
class StorageService {
    constructor(db) {
        this.db = db;
    }
    async getData(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }
    async getDataById(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.get(id);
            request.onsuccess = () => {
                const result = request.result;
                if (!result) {
                    resolve(null);
                }
                else {
                    resolve(result);
                }
            };
            request.onerror = (event) => reject(event.target.error);
        });
    }
    async addData(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const objectStore = transaction.objectStore(storeName);
            const putPromises = data.map((t) => {
                return new Promise((putResolve, putReject) => {
                    const request = objectStore.put(t);
                    request.onsuccess = () => putResolve();
                    request.onerror = (event) => putReject(event.target.error);
                });
            });
            Promise.all(putPromises)
                .then(async () => {
                resolve();
            })
                .catch(reject);
        });
    }
}
//# sourceMappingURL=storage.service.js.map