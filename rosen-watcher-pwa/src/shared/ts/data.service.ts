interface Asset {
  id: string;
  name: string;
  quantity: number;
  amount: number;
  decimals: number;
  tokenId: string | null;
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
  assets: Asset[];
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class DataService<T> {
  constructor(public db: IDBDatabase) {}
  abstract addData(
    address: string,
    transactions: TransactionItem[],
    db: IDBDatabase,
    profile: string | undefined,
  ): Promise<void>;
  abstract getDataType(): string;
  getMaxDownloadDateDifference(): number {
    return 3155760000000;
  }

  abstract getExistingData(transaction: TransactionItem, address: string): Promise<T | null>;

  async getData<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction([storeName], 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore(storeName);
      const request: IDBRequest = objectStore.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }
}
