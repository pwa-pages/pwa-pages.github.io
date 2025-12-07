
class StorageService<T> {
  constructor(public db: IDBDatabase) { }


  async getData(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(
        [storeName],
        'readonly',
      );
      const objectStore: IDBObjectStore = transaction.objectStore(storeName);
      const request: IDBRequest = objectStore.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = (event: Event) =>
        reject((event.target as IDBRequest).error);
    });
  }

  public async getDataById(
    storeName: string,
    id: IDBValidKey | IDBKeyRange
  ): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(
        [storeName],
        'readonly',
      );
      const objectStore: IDBObjectStore =
        transaction.objectStore(storeName);
      const request: IDBRequest = objectStore.get(id);

      request.onsuccess = () => {
        const result: T | undefined = request.result as
          | T
          | undefined;
        if (!result) {
          resolve(null);
        } else {
          resolve(result);
        }
      };

      request.onerror = (event: Event) =>
        reject((event.target as IDBRequest).error);
    });
  }

  async addData(storeName: string, data: T[]): Promise<void> {

    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(
        [storeName],
        'readwrite',
      );
      const objectStore: IDBObjectStore =
        transaction.objectStore(storeName);

      const putPromises = data.map((t: T) => {
        return new Promise<void>((putResolve, putReject) => {
          const request: IDBRequest = objectStore.put(t);
          request.onsuccess = () => putResolve();
          request.onerror = (event: Event) =>
            putReject((event.target as IDBRequest).error);
        });
      });

      Promise.all(putPromises)
        .then(async () => {


          resolve();
        })
        .catch(reject);

    });

  }

}
