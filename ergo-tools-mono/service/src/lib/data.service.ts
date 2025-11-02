interface Asset {
  id: string;
  name: string;
  quantity: number;
  amount: number;
  decimals: number;
  tokenId: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PermitTx {
  id: string;
  date: Date;
  boxId: string;
  assets: Asset[];
  address: string;
  chainType?: string;
  wid: string;
  transactionId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PermitInfo {
  lockedRSN: number;
  activeLockedRSN: number;
  address: string;
  wid: string;
  chainType: ChainType;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface DbInput {
  outputAddress: string;
  inputDate: Date;
  boxId: string;
  assets: Asset[];
  address?: string;
  chainType?: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Input {
  boxId: string;
  outputAddress: string;
  inputDate: Date;
  assets: Asset[];
  address: string;
  amount?: number;
  accumulatedAmount?: number;
  chainType?: ChainType | null;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Output {
  boxId: string;
  outputDate: Date;
  assets: Asset[];
  address: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class DataService<T> {
  constructor(public db: IDBDatabase) {}

  abstract addData(
    address: string,
    transactions: TransactionItem[],
    db: IDBDatabase,
  ): Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async purgeData(_db: IDBDatabase): Promise<void> {
    // Empty implementation
  }

  abstract getDataType(): string;
  getMaxDownloadDateDifference(): number {
    return 3155760000000;
  }

  abstract getExistingData(
    transaction: TransactionItem,
    address: string,
  ): Promise<T | null>;

  async getData<T>(storeName: string): Promise<T[]> {
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
  async getDataWithCursor<T>(
    storeName: string,
    filterFn?: (item: T) => boolean,
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      const transaction = this.db.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const value = cursor.value as T;
          if (!filterFn || filterFn(value)) {
            results.push(value);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }
}
