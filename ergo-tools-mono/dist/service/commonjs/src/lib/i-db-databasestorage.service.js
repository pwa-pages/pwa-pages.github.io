"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDBDatabaseStorageService = void 0;
class IDBDatabaseStorageService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getData(storeName, key) {
        return new Promise((resolve, reject) => {
            const start = performance.now();
            const label = `StorageService:getData(${storeName})`;
            const tx = this.db.transaction([storeName], 'readonly');
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
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readonly');
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
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readwrite');
            const store = tx.objectStore(storeName);
            tx.oncomplete = () => resolve();
            tx.onabort = () => reject(tx.error ?? new Error('Write transaction aborted'));
            try {
                for (const item of data) {
                    if (key) {
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
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readwrite');
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
