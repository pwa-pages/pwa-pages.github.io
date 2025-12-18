class IDBDatabaseStorageService<T> implements IStorageService<T> {
  constructor(public db: IDBDatabase) { }



  async getData<S>(storeName: string): Promise<T[] | S[]> {
    return new Promise((resolve, reject) => {
      const start =
        typeof performance !== 'undefined' && performance.now
          ? performance.now()
          : Date.now();
      const label = `StorageService:getData(${storeName})`;

      const tx = this.db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = request.result as T[];

        const end =
          typeof performance !== 'undefined' && performance.now
            ? performance.now()
            : Date.now();
        const duration = Math.round(end - start);

        console.log(
          `${label} - loaded ${result.length} items in ${duration}ms`
        );

        resolve(result as T[] | S[]);
      };

      request.onerror = e =>
        reject((e.target as IDBRequest).error);
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
        const result = request.result as T | undefined;
        resolve(result ?? null);
      };

      request.onerror = e =>
        reject((e.target as IDBRequest).error);
    });
  }

  async addData<S = T>(
    storeName: string,
    data: S[]
  ): Promise<void> {
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

  async deleteData(
    storeName: string,
    keys: IDBValidKey | IDBValidKey[]
  ): Promise<void> {
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
