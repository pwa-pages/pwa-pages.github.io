type StoreCache<T> = {
  byId: Map<IDBValidKey, T>;
};

class StorageService<T> {
  private cacheMap: Map<string, StoreCache<T>> = new Map();

  constructor(public db: IDBDatabase) {}

  /* ------------------ INTERNAL ------------------ */

  private getStoreCache(storeName: string): StoreCache<T> {
    let sc = this.cacheMap.get(storeName);
    if (!sc) {
      sc = { byId: new Map<IDBValidKey, T>() };
      this.cacheMap.set(storeName, sc);
    }
    return sc;
  }

  private getKey(keyPath: any, item: T): IDBValidKey | undefined {
    if (Array.isArray(keyPath)) {
      const key = keyPath.map(kp => (item as any)[kp]);
      return key.every(k => k !== undefined) ? key : undefined;
    }
    return (item as any)[keyPath];
  }

  /* ------------------ READ ALL ------------------ */

  async getData<S>(storeName: string): Promise<T[] | S[]> {
    const storeCache = this.getStoreCache(storeName);

    if (storeCache.byId.size > 0) {
      return Array.from(storeCache.byId.values()) as T[] | S[];
    }

    return new Promise((resolve, reject) => {
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

        resolve(result as T[] | S[]);
      };

      request.onerror = e =>
        reject((e.target as IDBRequest).error);
    });
  }

  /* ------------------ READ BY ID ------------------ */

  async getDataById(storeName: string, id: IDBValidKey): Promise<T | null> {
    const storeCache = this.getStoreCache(storeName);

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

      request.onerror = e =>
        reject((e.target as IDBRequest).error);
    });
  }

  /* ------------------ WRITE ------------------ */

  async addData<S = T>(storeName: string, data: S[]): Promise<void> {
    const storeCache = this.getStoreCache(storeName);
    storeCache.byId.clear();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);

      Promise.all(
        data.map(
          item =>
            new Promise<void>((res, rej) => {
              const req = store.put(item);
              req.onsuccess = () => res();
              req.onerror = e =>
                rej((e.target as IDBRequest).error);
            })
        )
      )
        .then(() => resolve())
        .catch(reject);
    });
  }

  async deleteData(storeName: string, keys: IDBValidKey | IDBValidKey[]): Promise<void> {
    const storeCache = this.getStoreCache(storeName);
    storeCache.byId.clear();

    const arr = Array.isArray(keys) ? keys : [keys];

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);

      Promise.all(
        arr.map(
          key =>
            new Promise<void>((res, rej) => {
              const req = store.delete(key);
              req.onsuccess = () => res();
              req.onerror = e =>
                rej((e.target as IDBRequest).error);
            })
        )
      )
        .then(() => resolve())
        .catch(reject);
    });
  }
}
