type StoreCache = {
  all?: any[];
  byId?: Map<IDBValidKey | IDBKeyRange, any>;
};

const GLOBAL_CACHE_KEY = '__StorageServiceCache_v1__';

class StorageService<T> {
  private cacheMap: Map<string, StoreCache>;

  constructor(public db: IDBDatabase) {
    const globalAny = globalThis as any;
    if (!globalAny[GLOBAL_CACHE_KEY]) {
      // WeakMap keyed by IDBDatabase so caches are GC-able when DB is gone
      globalAny[GLOBAL_CACHE_KEY] = new WeakMap<IDBDatabase, Map<string, StoreCache>>();
    }
    const dbWeakMap: WeakMap<IDBDatabase, Map<string, StoreCache>> = globalAny[GLOBAL_CACHE_KEY];
    let m = dbWeakMap.get(db);
    if (!m) {
      m = new Map<string, StoreCache>();
      dbWeakMap.set(db, m);
    }
    this.cacheMap = m;
  }

  private getStoreCache(storeName: string): StoreCache {
    let sc = this.cacheMap.get(storeName);
    if (!sc) {
      sc = { byId: new Map() };
      this.cacheMap.set(storeName, sc);
    }
    return sc;
  }

  async getData<S = unknown>(storeName: string): Promise<T[] | S[]> {
    const storeCache = this.getStoreCache(storeName);
    if (storeCache.all) {
      // return a shallow copy to reduce accidental external mutation
      return Promise.resolve(storeCache.all.slice() as T[] | S[]);
    }

    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction([storeName], 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore(storeName);
      const request: IDBRequest = objectStore.getAll();

      request.onsuccess = () => {
        const result = request.result as T[] | S[];
        // cache the results
        storeCache.all = result.slice();
        // populate byId if possible (when keyPath is available)
        try {
          const keyPath = (objectStore as any).keyPath;
          if (keyPath != null) {
            storeCache.byId = storeCache.byId || new Map();
            for (const item of result) {
              let key: any;
              if (Array.isArray(keyPath)) {
                key = keyPath.map((kp: string) => (item as any)[kp]);
              } else {
                key = (item as any)[keyPath];
              }
              // only set if key is usable
              if (key !== undefined) {
                storeCache.byId.set(key, item);
              }
            }
          }
        } catch {
          // ignore caching by id if any error occurs
        }
        resolve(result);
      };

      request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }

  public async getDataById(
    storeName: string,
    id: IDBValidKey | IDBKeyRange
  ): Promise<T | null> {
    const storeCache = this.getStoreCache(storeName);
    if (storeCache.byId && storeCache.byId.has(id)) {
      return Promise.resolve((storeCache.byId.get(id) as T) ?? null);
    }

    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction([storeName], 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore(storeName);
      const request: IDBRequest = objectStore.get(id);

      request.onsuccess = () => {
        const result: T | undefined = request.result as T | undefined;
        if (!result) {
          resolve(null);
          return;
        }

        // cache by id
        try {
          storeCache.byId = storeCache.byId || new Map();
          storeCache.byId.set(id, result);

          // if we have a cached "all" and can determine the keyPath, update the cached array
          const keyPath = (objectStore as any).keyPath;
          if (storeCache.all && keyPath != null) {
            // determine key for result using keyPath
            let itemKey: any;
            if (Array.isArray(keyPath)) {
              itemKey = keyPath.map((kp: string) => (result as any)[kp]);
            } else {
              itemKey = (result as any)[keyPath];
            }
            // replace existing entry with same key, otherwise push
            if (itemKey !== undefined) {
              const idx = storeCache.all.findIndex((it) => {
                try {
                  if (Array.isArray(keyPath)) {
                    return JSON.stringify(keyPath.map((kp: string) => (it as any)[kp])) === JSON.stringify(itemKey);
                  } else {
                    return (it as any)[keyPath] === itemKey;
                  }
                } catch {
                  return false;
                }
              });
              if (idx >= 0) storeCache.all[idx] = result;
              else storeCache.all.push(result);
            }
          }
        } catch {
          // ignore cache updates on any error
        }

        resolve(result ?? null);
      };

      request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }

  async addData<S = unknown>(storeName: string, data: T[] | S[]): Promise<void> {
    // Invalidate cache for this store to keep things simple and safe
    this.cacheMap.delete(storeName);

    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction([storeName], 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(storeName);

      const putPromises = data.map((t: T | S) => {
        return new Promise<void>((putResolve, putReject) => {
          const request: IDBRequest = objectStore.put(t);
          request.onsuccess = () => putResolve();
          request.onerror = (event: Event) => putReject((event.target as IDBRequest).error);
        });
      });

      Promise.all(putPromises)
        .then(() => resolve())
        .catch(reject);
    });
  }

  async deleteData(
    storeName: string,
    keys: IDBValidKey | IDBKeyRange | Array<IDBValidKey | IDBKeyRange>
  ): Promise<void> {
    // Invalidate cache for this store to keep things simple and safe
    this.cacheMap.delete(storeName);

    const keysArray = Array.isArray(keys) ? keys : [keys];

    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction([storeName], 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(storeName);

      const deletePromises = keysArray.map((key) => {
        return new Promise<void>((delResolve, delReject) => {
          const request: IDBRequest = objectStore.delete(key);
          request.onsuccess = () => delResolve();
          request.onerror = (event: Event) => delReject((event.target as IDBRequest).error);
        });
      });

      Promise.all(deletePromises)
        .then(() => resolve())
        .catch(reject);
    });
  }
}
