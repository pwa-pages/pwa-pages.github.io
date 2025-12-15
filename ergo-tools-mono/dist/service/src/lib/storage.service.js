"use strict";
class StorageService {
    constructor(db) {
        this.db = db;
        this.cacheMap = new Map();
    }
    /* ------------------ INTERNAL ------------------ */
    getStoreCache(storeName) {
        let sc = this.cacheMap.get(storeName);
        if (!sc) {
            sc = { byId: new Map() };
            this.cacheMap.set(storeName, sc);
        }
        return sc;
    }
    getKey(keyPath, item) {
        if (Array.isArray(keyPath)) {
            const key = keyPath.map(kp => item[kp]);
            return key.every(k => k !== undefined) ? key : undefined;
        }
        return item[keyPath];
    }
    /* ------------------ READ ALL ------------------ */
    async getData(storeName) {
        const storeCache = this.getStoreCache(storeName);
        if (storeCache.byId.size > 0) {
            return Array.from(storeCache.byId.values());
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => {
                const result = request.result;
                const keyPath = store.keyPath;
                storeCache.byId.clear();
                if (keyPath != null) {
                    for (const item of result) {
                        const key = this.getKey(keyPath, item);
                        if (key !== undefined) {
                            storeCache.byId.set(key, item);
                        }
                    }
                }
                resolve(result);
            };
            request.onerror = e => reject(e.target.error);
        });
    }
    /* ------------------ READ BY ID ------------------ */
    async getDataById(storeName, id) {
        const storeCache = this.getStoreCache(storeName);
        if (storeCache.byId.has(id)) {
            return storeCache.byId.get(id);
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => {
                const result = request.result;
                if (!result) {
                    resolve(null);
                    return;
                }
                const keyPath = store.keyPath;
                const key = keyPath ? this.getKey(keyPath, result) : id;
                if (key !== undefined) {
                    storeCache.byId.set(key, result);
                }
                resolve(result);
            };
            request.onerror = e => reject(e.target.error);
        });
    }
    /* ------------------ WRITE ------------------ */
    async addData(storeName, data) {
        const storeCache = this.getStoreCache(storeName);
        storeCache.byId.clear();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readwrite');
            const store = tx.objectStore(storeName);
            Promise.all(data.map(item => new Promise((res, rej) => {
                const req = store.put(item);
                req.onsuccess = () => res();
                req.onerror = e => rej(e.target.error);
            })))
                .then(() => resolve())
                .catch(reject);
        });
    }
    async deleteData(storeName, keys) {
        const storeCache = this.getStoreCache(storeName);
        storeCache.byId.clear();
        const arr = Array.isArray(keys) ? keys : [keys];
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readwrite');
            const store = tx.objectStore(storeName);
            Promise.all(arr.map(key => new Promise((res, rej) => {
                const req = store.delete(key);
                req.onsuccess = () => res();
                req.onerror = e => rej(e.target.error);
            })))
                .then(() => resolve())
                .catch(reject);
        });
    }
}
//# sourceMappingURL=storage.service.js.map