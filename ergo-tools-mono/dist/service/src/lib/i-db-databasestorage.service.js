"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDBDatabaseStorageService = void 0;
const constants_1 = require("./constants");
class IDBDatabaseStorageService {
    constructor() {
        this.db = this.initIndexedDB();
    }
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            let dbName = constants_1.rs_DbName;
            const request = indexedDB.open(dbName);
            request.onsuccess = (event) => {
                const db = event.target.result;
                resolve(db);
            };
            request.onerror = (event) => {
                console.error('Error opening IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    async getData(storeName, key) {
        return new Promise(async (resolve, reject) => {
            const start = performance.now();
            const label = `StorageService:getData(${storeName})`;
            const db = await this.db;
            const tx = db.transaction([storeName], 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll(key);
            request.onsuccess = () => {
                const result = request.result;
                const duration = Math.round(performance.now() - start);
                console.log(`${label} - loaded ${result.length} items in ${duration}ms`);
                resolve(result);
            };
            request.onerror = () => reject(request.error);
            tx.onabort = () => reject(tx.error ?? new Error('Read transaction aborted'));
        });
    }
    async getDataById(storeName, id) {
        return new Promise(async (resolve, reject) => {
            const db = await this.db;
            const tx = db.transaction([storeName], 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => {
                resolve(request.result ?? null);
            };
            request.onerror = () => reject(request.error);
            tx.onabort = () => reject(tx.error ?? new Error('Read transaction aborted'));
        });
    }
    async addData(storeName, data, key) {
        return new Promise(async (resolve, reject) => {
            const db = await this.db;
            const tx = db.transaction([storeName], 'readwrite');
            const store = tx.objectStore(storeName);
            tx.oncomplete = () => resolve();
            tx.onabort = () => reject(tx.error ?? new Error('Write transaction aborted'));
            try {
                for (const item of data) {
                    if (key !== undefined && store.keyPath === null) {
                        store.put(item, key);
                    }
                    else {
                        store.put(item);
                    }
                }
            }
            catch (error) {
                try {
                    tx.abort();
                }
                catch {
                    // Transaction may already be inactive.
                }
                reject(error);
            }
        });
    }
    async deleteData(storeName, keys) {
        const arr = Array.isArray(keys) ? keys : [keys];
        return new Promise(async (resolve, reject) => {
            const db = await this.db;
            const tx = db.transaction([storeName], 'readwrite');
            const store = tx.objectStore(storeName);
            tx.oncomplete = () => resolve();
            tx.onabort = () => reject(tx.error ?? new Error('Delete transaction aborted'));
            try {
                for (const key of arr) {
                    store.delete(key);
                }
            }
            catch (error) {
                try {
                    tx.abort();
                }
                catch {
                    // Transaction may already be inactive.
                }
                reject(error);
            }
        });
    }
}
exports.IDBDatabaseStorageService = IDBDatabaseStorageService;
//# sourceMappingURL=i-db-databasestorage.service.js.map