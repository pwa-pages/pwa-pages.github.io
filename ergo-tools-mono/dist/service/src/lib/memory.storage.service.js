"use strict";
class MemoryStorageService {
    getMemoryStore() {
        const g = globalThis;
        if (!g.__storageServiceStore) {
            g.__storageServiceStore = {};
        }
        return g.__storageServiceStore;
    }
    generateKey(storeName, key) {
        if (Array.isArray(key)) {
            return storeName + ':' + key.map(k => String(k)).join(',');
        }
        return storeName + ':' + String(key);
    }
    async getData(storeName) {
        return new Promise((resolve) => {
            const start = typeof performance !== 'undefined' && performance.now
                ? performance.now()
                : Date.now();
            const store = this.getMemoryStore();
            const prefix = storeName + ':';
            const result = Object.keys(store)
                .filter(key => key.startsWith(prefix))
                .map(key => store[key]);
            const end = typeof performance !== 'undefined' && performance.now
                ? performance.now()
                : Date.now();
            const duration = Math.round(end - start);
            console.log(`StorageService:getData(${storeName}) - loaded ${result.length} items in ${duration}ms`);
            resolve(result);
        });
    }
    async getDataById(storeName, id) {
        return new Promise((resolve) => {
            const key = this.generateKey(storeName, id);
            const store = this.getMemoryStore();
            resolve(store[key] ?? null);
        });
    }
    async addData(storeName, data) {
        return new Promise((resolve) => {
            const store = this.getMemoryStore();
            data.forEach(item => {
                const id = item.id ?? Math.random().toString(36).slice(2); // fallback id if missing
                const key = this.generateKey(storeName, id);
                store[key] = item;
            });
            resolve();
        });
    }
    async deleteData(storeName, keys) {
        const arr = Array.isArray(keys) ? keys : [keys];
        return new Promise((resolve) => {
            const store = this.getMemoryStore();
            arr.forEach(key => {
                const storageKey = this.generateKey(storeName, key);
                delete store[storageKey];
            });
            resolve();
        });
    }
}
//# sourceMappingURL=memory.storage.service.js.map