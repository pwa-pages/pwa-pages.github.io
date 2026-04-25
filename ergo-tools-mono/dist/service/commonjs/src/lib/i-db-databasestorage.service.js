class IDBDatabaseStorageService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getData(storeName) {
        return new Promise((resolve, reject) => {
            const start = typeof performance !== 'undefined' && performance.now
                ? performance.now()
                : Date.now();
            const label = `StorageService:getData(${storeName})`;
            const tx = this.db.transaction([storeName], 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => {
                const result = request.result;
                const end = typeof performance !== 'undefined' && performance.now
                    ? performance.now()
                    : Date.now();
                const duration = Math.round(end - start);
                console.log(`${label} - loaded ${result.length} items in ${duration}ms`);
                resolve(result);
            };
            request.onerror = e => reject(e.target.error);
        });
    }
    async getDataById(storeName, id) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ?? null);
            };
            request.onerror = e => reject(e.target.error);
        });
    }
    async addData(storeName, data) {
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
