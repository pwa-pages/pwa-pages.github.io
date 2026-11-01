
class IDBDatabaseStorageService<T> implements IStorageService<T> {
  constructor(public db: IDBDatabase) { }

  async getData<S>(storeName: string, key?: IDBValidKey): Promise<T[] | S[]> {
    return new Promise((resolve, reject) => {
      const start = performance.now();
      const label = `StorageService:getData(${storeName})`;

      const tx = this.db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll(key);

      request.onsuccess = () => {
        const result = request.result as T[];

        const duration = Math.round(performance.now() - start);

        console.log(
          `${label} - loaded ${result.length} items in ${duration}ms`
        );

        resolve(result as T[] | S[]);
      };

      request.onerror = () => reject(request.error);
      tx.onabort = () =>
        reject(tx.error ?? new Error('Read transaction aborted'));
    });
  }

  async getDataById(
    storeName: string,
    id: IDBValidKey
  ): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve((request.result as T | undefined) ?? null);
      };

      request.onerror = () => reject(request.error);
      tx.onabort = () =>
        reject(tx.error ?? new Error('Read transaction aborted'));
    });
  }

  async addData<S = T>(
    storeName: string,
    data: S[],
    key?: IDBValidKey
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);

      tx.oncomplete = () => resolve();

      tx.onabort = () =>
        reject(tx.error ?? new Error('Write transaction aborted'));

      try {
        for (const item of data) {
          if(key) {
            store.put(item, key);
          } else {
            store.put(item);
          } 
        }
      } catch (error) {
        try {
          tx.abort();
        } catch {
          // Transaction may already be inactive.
        }
        reject(error);
      }
    });
  }

  async deleteData(
    storeName: string,
    keys: IDBValidKey | IDBValidKey[]
  ): Promise<void> {
    const arr = Array.isArray(keys) ? keys : [keys];

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);

      tx.oncomplete = () => resolve();

      tx.onabort = () =>
        reject(tx.error ?? new Error('Delete transaction aborted'));

      try {
        for (const key of arr) {
          store.delete(key);
        }
      } catch (error) {
        try {
          tx.abort();
        } catch {
          // Transaction may already be inactive.
        }
        reject(error);
      }
    });
  }
}
