"use strict";
class StorageService {
    // Use globalThis for shared cache across all instances
    static getCacheMap() {
        if (!globalThis.__storageCacheMap) {
            globalThis.__storageCacheMap = new Map();
        }
        return globalThis.__storageCacheMap;
    }
    constructor(db) {
        this.db = db;
    }
    /* ------------------ INTERNAL ------------------ */
    getStoreCache(storeName) {
        const cacheMap = StorageService.getCacheMap();
        let sc = cacheMap.get(storeName);
        if (!sc) {
            sc = { byId: new Map() };
            cacheMap.set(storeName, sc);
        }
        return sc;
    }
    getKey(keyPath, item) {
        let key;
        if (Array.isArray(keyPath)) {
            const parts = keyPath.map(kp => item[kp]);
            if (parts.some(p => p === undefined))
                return undefined;
            key = parts;
        }
        else {
            key = item[keyPath];
        }
        if (key === undefined)
            return undefined;
        if (Array.isArray(key)) {
            return [].concat(key).join('|');
        }
        if (key instanceof Date)
            return key.getTime();
        return key;
    }
    /* ------------------ READ ALL ------------------ */
    async getData(storeName) {
        const storeCache = this.getStoreCache(storeName);
        if (storeCache.byId.size > 0) {
            return Array.from(storeCache.byId.values());
        }
        return new Promise((resolve, reject) => {
            const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            const label = `StorageService:getData(${storeName})`;
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
                const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
                const duration = Math.round(end - start);
                console.log(`${label} - loaded ${result.length} items into cache in ${duration}ms`);
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
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readwrite');
            const store = tx.objectStore(storeName);
            const keyPath = store.keyPath;
            Promise.all(data.map(item => new Promise((res, rej) => {
                const req = store.put(item);
                req.onsuccess = () => {
                    res();
                    const key = this.getKey(keyPath, item);
                    if (key !== undefined) {
                        storeCache.byId.set(key, item);
                    }
                };
                req.onerror = e => rej(e.target.error);
            })))
                .then(() => resolve())
                .catch(reject);
        });
    }
    async deleteData(storeName, keys) {
        const storeCache = this.getStoreCache(storeName);
        const arr = Array.isArray(keys) ? keys : [keys];
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readwrite');
            const store = tx.objectStore(storeName);
            Promise.all(arr.map(key => new Promise((res, rej) => {
                const req = store.delete(key);
                req.onsuccess = () => {
                    storeCache.byId.delete(key);
                    res();
                };
                req.onerror = e => rej(e.target.error);
            })))
                .then(() => resolve())
                .catch(reject);
        });
    }
}
//# sourceMappingURL=storage.service.js.map