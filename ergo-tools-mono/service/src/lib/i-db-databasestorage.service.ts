import { IStorageService, rs_DbName } from "./constants";

export class IDBDatabaseStorageService implements IStorageService {
  private db: Promise<IDBDatabase>;

  constructor() {
    this.db = this.initIndexedDB();
  }

async initIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let dbName = rs_DbName;

    const request: IDBOpenDBRequest = indexedDB.open(dbName);

    request.onsuccess = (event: Event) => {
      const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event: Event) => {
      console.error(
        'Error opening IndexedDB:',
        (event.target as IDBOpenDBRequest).error,
      );
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

  

  async getData<S>(storeName: string, key?: IDBValidKey): Promise<S[]> {
    return new Promise(async (resolve, reject) => {
      const start = performance.now();
      const label = `StorageService:getData(${storeName})`;

      const db = await this.db;
      const tx = db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll(key);

      request.onsuccess = () => {
        const result = request.result as S[];

        const duration = Math.round(performance.now() - start);

        console.log(
          `${label} - loaded ${result.length} items in ${duration}ms`
        );

        resolve(result as S[]);
      };

      request.onerror = () => reject(request.error);
      tx.onabort = () =>
        reject(tx.error ?? new Error('Read transaction aborted'));
    });
  }

  async getDataById<S>(
    storeName: string,
    id: IDBValidKey
  ): Promise<S | null> {
    return new Promise(async (resolve, reject) => {
      const db = await this.db;
      const tx = db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve((request.result as S | undefined) ?? null);
      };

      request.onerror = () => reject(request.error);
      tx.onabort = () =>
        reject(tx.error ?? new Error('Read transaction aborted'));
    });
  }

  async addData<S>(
    storeName: string,
    data: S[],
    key?: IDBValidKey
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.db;
      const tx = db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);

      tx.oncomplete = () => resolve();

      tx.onabort = () =>
        reject(tx.error ?? new Error('Write transaction aborted'));

      try {
        for (const item of data) {
          if (key !== undefined && store.keyPath === null) {
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

    return new Promise(async (resolve, reject) => {
      const db = await this.db;
      const tx = db.transaction([storeName], 'readwrite');
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
