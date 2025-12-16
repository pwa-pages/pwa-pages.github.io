type StoreCache<T> = {
  byId: Map<IDBValidKey, T>;
};

class StorageService<T> {
  // Use globalThis for shared cache across all instances
  private static getCacheMap<T>(): Map<string, StoreCache<T>> {
    if (!(globalThis as any).__storageCacheMap) {
      (globalThis as any).__storageCacheMap = new Map<string, StoreCache<T>>();
    }
    return (globalThis as any).__storageCacheMap;
  }

  constructor(public db: IDBDatabase) { }

  /* ------------------ INTERNAL ------------------ */

  private getStoreCache<S>(storeName: string): StoreCache<T | S> {
    const cacheMap = StorageService.getCacheMap<T | S>();
    let sc = cacheMap.get(storeName);
    if (!sc) {
      sc = { byId: new Map<IDBValidKey, T | S>() };
      cacheMap.set(storeName, sc);
    }
    return sc;
  }

  private getKey<S>(keyPath: any, item: T | S): IDBValidKey | undefined {
    let key: IDBValidKey | undefined;

    if (Array.isArray(keyPath)) {
      const parts = keyPath.map(kp => (item as any)[kp]);
      if (parts.some(p => p === undefined)) return undefined;
      key = parts;
    } else {
      key = (item as any)[keyPath];
    }

    if (key === undefined) return undefined;

    if (Array.isArray(key)) {
      return ([] as any[]).concat(key).join('|');
    }

    if (key instanceof Date) return key.getTime();

    return key;
  }


  /* ------------------ READ ALL ------------------ */

  async getData<S>(storeName: string): Promise<T[] | S[]> {
    const storeCache = this.getStoreCache(storeName);

    if (storeCache.byId.size > 0) {
      return Array.from(storeCache.byId.values()) as T[] | S[];
    }

    return new Promise((resolve, reject) => {
      const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const label = `StorageService:getData(${storeName})`;

      const tx = this.db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = request.result as T[];
        const keyPath = store.keyPath as any;

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

        resolve(result as T[] | S[]);
      };

      request.onerror = e => reject((e.target as IDBRequest).error);
    });
  }

  /* ------------------ READ BY ID ------------------ */

  async getDataById(storeName: string, id: IDBValidKey): Promise<T | null> {
    const storeCache = this.getStoreCache<T>(storeName);

    if (storeCache.byId.has(id)) {
      return storeCache.byId.get(id)!;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as T | undefined;
        if (!result) {
          resolve(null);
          return;
        }

        const keyPath = store.keyPath as any;
        const key = keyPath ? this.getKey(keyPath, result) : id;

        if (key !== undefined) {
          storeCache.byId.set(key, result);
        }

        resolve(result);
      };

      request.onerror = e => reject((e.target as IDBRequest).error);
    });
  }

  /* ------------------ WRITE ------------------ */

  async addData<S = T>(storeName: string, data: S[]): Promise<void> {
    const storeCache = this.getStoreCache(storeName);

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);
      const keyPath = store.keyPath as any;

      Promise.all(
        data.map(
          item =>
            new Promise<void>((res, rej) => {
              const req = store.put(item);
              req.onsuccess = () => {
                res();
                const key = this.getKey<S>(keyPath, item);
                if (key !== undefined) {
                  storeCache.byId.set(key, item);
                }
              };
              req.onerror = e => rej((e.target as IDBRequest).error);
            })
        )
      )
        .then(() => resolve())
        .catch(reject);
    });
  }

  async deleteData(storeName: string, keys: IDBValidKey | IDBValidKey[]): Promise<void> {
    const storeCache = this.getStoreCache(storeName);
    const arr = Array.isArray(keys) ? keys : [keys];

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);

      Promise.all(
        arr.map(
          key =>
            new Promise<void>((res, rej) => {
              const req = store.delete(key);
              req.onsuccess = () => {
                storeCache.byId.delete(key);
                res();
              };
              req.onerror = e => rej((e.target as IDBRequest).error);
            })
        )
      )
        .then(() => resolve())
        .catch(reject);
    });
  }
}

