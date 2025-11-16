interface AddressData {
  address: string;
}

interface TransactionItem {
  outputCreatedAt: string | number | Date;
  timestamp: string;
  inputs: Input[];
  outputs: Output[];
  id: string;
}

interface FetchTransactionsResponse {
  transactions: TransactionItem[];
  items: TransactionItem[];
  total: number;
}

interface DownloadStatus {
  address: string;
  Address: string;
  status: string;
  lastDownloadDate: Date | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DownloadStatusIndexedDbService<T> {

  //private static addressDownloadDateMap = new Map<string, Date>();

  constructor(
    private dataService: DataService<T>,
    private db: IDBDatabase,
  ) {
  }

  // Get Download Status for Address from IndexedDB
  async getDownloadStatus(
    address: string
  ): Promise<DownloadStatus> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(
        [rs_DownloadStatusStoreName],
        'readonly',
      );
      const objectStore: IDBObjectStore = transaction.objectStore(
        rs_DownloadStatusStoreName,
      );
      const request: IDBRequest = objectStore.get(
        address + '_' + this.dataService.getDataType(),
      );

      request.onsuccess = () => resolve(request.result as DownloadStatus);
      request.onerror = (event: Event) =>
        reject((event.target as IDBRequest).error);
    });
  }

  // Set Download Status for Address in IndexedDB
  async setDownloadStatus(
    address: string,
    status: string,
  ): Promise<void> {
    let dbStatus: DownloadStatus | undefined = await this.getDownloadStatus(
      address
    );

    if (!dbStatus) {
      dbStatus = {
        address: address + '_' + this.dataService.getDataType(),
        Address: address,
        status: status,
        lastDownloadDate: undefined,
      };
    } else {
      dbStatus.status = status;
      dbStatus.address = address + '_' + this.dataService.getDataType();
      dbStatus.Address = address;
    }

    await this.saveDownloadStatus(dbStatus);
  }

  async saveDownloadStatus(
    downloadStatus: DownloadStatus
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(
        [rs_DownloadStatusStoreName],
        'readwrite',
      );
      const objectStore: IDBObjectStore = transaction.objectStore(
        rs_DownloadStatusStoreName,
      );

      const request: IDBRequest = objectStore.put(downloadStatus);

      request.onsuccess = () => resolve();
      request.onerror = (event: Event) =>
        reject((event.target as IDBRequest).error);
    });
  }

}
