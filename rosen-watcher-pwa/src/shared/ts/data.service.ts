// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class DataService {
  constructor(public db: IDBDatabase) {}
  abstract addData(
    address: string,
    transactions: TransactionItem[],
    db: IDBDatabase,
    profile: string | undefined,
  ): Promise<void>;
  abstract getDataType(): string;
  abstract getDataByBoxId(boxId: string, address: string, db: IDBDatabase): Promise<DbInput | null>;

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
