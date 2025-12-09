"use strict";
const GLOBAL_CACHE_KEY = '__StorageServiceCache_v1__';
class StorageService {
    constructor(db) {
        this.db = db;
        const globalAny = globalThis;
        if (!globalAny[GLOBAL_CACHE_KEY]) {
            // WeakMap keyed by IDBDatabase so caches are GC-able when DB is gone
            globalAny[GLOBAL_CACHE_KEY] = new WeakMap();
        }
        const dbWeakMap = globalAny[GLOBAL_CACHE_KEY];
        let m = dbWeakMap.get(db);
        if (!m) {
            m = new Map();
            dbWeakMap.set(db, m);
        }
        this.cacheMap = m;
    }
    getStoreCache(storeName) {
        let sc = this.cacheMap.get(storeName);
        if (!sc) {
            sc = { byId: new Map() };
            this.cacheMap.set(storeName, sc);
        }
        return sc;
    }
    async getData(storeName) {
        const storeCache = this.getStoreCache(storeName);
        if (storeCache.all) {
            // return a shallow copy to reduce accidental external mutation
            return Promise.resolve(storeCache.all.slice());
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.getAll();
            request.onsuccess = () => {
                const result = request.result;
                // cache the results
                storeCache.all = result.slice();
                // populate byId if possible (when keyPath is available)
                try {
                    const keyPath = objectStore.keyPath;
                    if (keyPath != null) {
                        storeCache.byId = storeCache.byId || new Map();
                        for (const item of result) {
                            let key;
                            if (Array.isArray(keyPath)) {
                                key = keyPath.map((kp) => item[kp]);
                            }
                            else {
                                key = item[keyPath];
                            }
                            // only set if key is usable
                            if (key !== undefined) {
                                storeCache.byId.set(key, item);
                            }
                        }
                    }
                }
                catch {
                    // ignore caching by id if any error occurs
                }
                resolve(result);
            };
            request.onerror = (event) => reject(event.target.error);
        });
    }
    async getDataById(storeName, id) {
        const storeCache = this.getStoreCache(storeName);
        if (storeCache.byId && storeCache.byId.has(id)) {
            return Promise.resolve(storeCache.byId.get(id) ?? null);
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.get(id);
            request.onsuccess = () => {
                const result = request.result;
                if (!result) {
                    resolve(null);
                    return;
                }
                // cache by id
                try {
                    storeCache.byId = storeCache.byId || new Map();
                    storeCache.byId.set(id, result);
                    // if we have a cached "all" and can determine the keyPath, update the cached array
                    const keyPath = objectStore.keyPath;
                    if (storeCache.all && keyPath != null) {
                        // determine key for result using keyPath
                        let itemKey;
                        if (Array.isArray(keyPath)) {
                            itemKey = keyPath.map((kp) => result[kp]);
                        }
                        else {
                            itemKey = result[keyPath];
                        }
                        // replace existing entry with same key, otherwise push
                        if (itemKey !== undefined) {
                            const idx = storeCache.all.findIndex((it) => {
                                try {
                                    if (Array.isArray(keyPath)) {
                                        return JSON.stringify(keyPath.map((kp) => it[kp])) === JSON.stringify(itemKey);
                                    }
                                    else {
                                        return it[keyPath] === itemKey;
                                    }
                                }
                                catch {
                                    return false;
                                }
                            });
                            if (idx >= 0)
                                storeCache.all[idx] = result;
                            else
                                storeCache.all.push(result);
                        }
                    }
                }
                catch {
                    // ignore cache updates on any error
                }
                resolve(result ?? null);
            };
            request.onerror = (event) => reject(event.target.error);
        });
    }
    async addData(storeName, data) {
        // Invalidate cache for this store to keep things simple and safe
        this.cacheMap.delete(storeName);
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
                .then(() => resolve())
                .catch(reject);
        });
    }
    async deleteData(storeName, keys) {
        // Invalidate cache for this store to keep things simple and safe
        this.cacheMap.delete(storeName);
        const keysArray = Array.isArray(keys) ? keys : [keys];
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const objectStore = transaction.objectStore(storeName);
            const deletePromises = keysArray.map((key) => {
                return new Promise((delResolve, delReject) => {
                    const request = objectStore.delete(key);
                    request.onsuccess = () => delResolve();
                    request.onerror = (event) => delReject(event.target.error);
                });
            });
            Promise.all(deletePromises)
                .then(() => resolve())
                .catch(reject);
        });
    }
}
//# sourceMappingURL=storage.service.js.map