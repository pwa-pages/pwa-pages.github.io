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
class DownloadService<T> {
  private busyCounter = 0;
  private downloadFullSize = rs_FullDownloadsBatchSize;
  private downloadInitialSize = rs_InitialNDownloads;
  //private static addressDownloadDateMap = new Map<string, Date>();

  constructor(
    downloadFullSize: number,
    downloadInitialSize: number,
    private dataService: DataService<T>,
    private eventSender: EventSender,
    private db: IDBDatabase,
  ) {
    this.downloadFullSize = downloadFullSize;
    this.downloadInitialSize = downloadInitialSize;
  }

  async fetchTransactions(url: string): Promise<FetchTransactionsResponse> {
    try {
      const response: Response = await fetch(url);
      if (!response.ok) throw new Error(`Server returned code: ${response.status}`);
      return (await response.json()) as FetchTransactionsResponse;
    } catch (error) {
      console.error(`An error occurred: ${error}`);
      throw error;
    }
  }

  async downloadTransactions(
    address: string,
    offset = 0,
    limit = 500,
  ): Promise<FetchTransactionsResponse> {
    const url = `https://${rs_ErgoExplorerHost}/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;
    console.log(`Downloading from: ${url}`);

    const response: FetchTransactionsResponse = await this.fetchTransactions(url);
    const result: FetchTransactionsResponse = {
      transactions: response.items,
      total: response.total,
      items: [],
    };

    for (const item of response.items) {
      const inputDate: Date = new Date(item.timestamp);
      if (inputDate < rs_StartFrom) {
        return result;
      }
    }

    return result;
  }

  async downloadForAddresses(): Promise<void> {
    try {
      const addresses: AddressData[] =
        await this.dataService.getData<AddressData>(rs_AddressDataStoreName);

      const downloadPromises: Promise<void>[] = addresses.map(async (addressObj: AddressData) => {
        await this.downloadForAddress(addressObj.address);
      });

      await Promise.all(downloadPromises);
    } catch (e) {
      console.error('Error downloading for addresses:', e);
    }
  }

  // Busy Counter
  private increaseBusyCounter(): void {
    if (this.busyCounter === 0) {
      this.eventSender.sendEvent({
        type: 'StartFullDownload',
      });
    }
    this.busyCounter++;
  }

  private decreaseBusyCounter(): void {
    this.busyCounter--;
    if (this.busyCounter === 0) {
      this.eventSender.sendEvent({
        type: 'EndFullDownload',
      });
    }
  }

  // Download All for Address (recursive)
  async downloadAllForAddress(address: string, offset: number, db: IDBDatabase): Promise<void> {
    this.increaseBusyCounter();
    console.log(this.busyCounter);

    try {
      const result: FetchTransactionsResponse = await this.downloadTransactions(
        address,
        offset,
        this.downloadFullSize + 10,
      );
      console.log(
        `Processing full download(offset = ${offset}, size = ${this.downloadFullSize}) for: ${address}`,
      );

      //const t = this.processItems(result.transactions);
      //console.log('permit amount ' + t);

      if (!result.transactions || result.transactions.length === 0 || offset > 100000) {
        await this.setDownloadStatus(address, 'true', db);
        console.log(this.busyCounter);
        return;
      }

      await this.dataService.addData(address, result.transactions, db);
      //await this.dataService.compressInputs();

      if (
        this.dataService.getMaxDownloadDateDifference() >
        new Date().getTime() -
          new Date(result.transactions[result.transactions.length - 1].timestamp).getTime()
      ) {
        await this.downloadAllForAddress(address, offset + this.downloadFullSize, db);
      } else {
        await this.setDownloadStatus(address, 'true', db);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.decreaseBusyCounter();
      console.log(this.busyCounter);
    }
  }
  /*
  processItems(items: TransactionItem[]): number {
    let r = 0;
    items.forEach((item) => {
      
      item.inputs.forEach((i) => {
        i.assets.forEach((a) => {
          if (a.name == 'rspv2CardanoRWT') {
            r -= a.amount;
          }
        });
      });
      

      item.outputs.forEach((o) => {
        if (!getChainType(o.address)) {
          o.assets.forEach((a) => {
            if (a.name == 'rspv2CardanoRWT') {
              r += a.amount;
              if (a.amount > 30000000) {
                console.log('wtfffffffffffffff ' + a.amount);
              }
            }
          });
        }
      });
    });

    return r / 3000000;
  }
  */

  // Get Download Status for Address from IndexedDB
  async getDownloadStatus(address: string, db: IDBDatabase): Promise<DownloadStatus> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = db.transaction([rs_DownloadStatusStoreName], 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore(rs_DownloadStatusStoreName);
      const request: IDBRequest = objectStore.get(address + '_' + this.dataService.getDataType());

      request.onsuccess = () => resolve(request.result as DownloadStatus);
      request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }

  // Set Download Status for Address in IndexedDB
  async setDownloadStatus(address: string, status: string, db: IDBDatabase): Promise<void> {
    let dbStatus: DownloadStatus | undefined = await this.getDownloadStatus(address, db);

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

    await this.saveDownloadStatus(dbStatus, db);
  }

  async saveDownloadStatus(downloadStatus: DownloadStatus, db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = db.transaction([rs_DownloadStatusStoreName], 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(rs_DownloadStatusStoreName);

      const request: IDBRequest = objectStore.put(downloadStatus);

      request.onsuccess = () => resolve();
      request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }

  async downloadForAddress(address: string): Promise<void> {
    /*const downloadStatus = await this.getDownloadStatus(address, this.db);

    
    if (downloadStatus?.lastDownloadDate) {
      const lastDownloadDate: Date | undefined = downloadStatus.lastDownloadDate;
      if (lastDownloadDate && lastDownloadDate.getTime() > new Date().getTime() - 1000 * 120) {
        return;
      }
    }

    if (downloadStatus) {
      downloadStatus.lastDownloadDate = new Date();
      await this.saveDownloadStatus(downloadStatus, this.db);
    }
*/
    this.increaseBusyCounter();
    console.log(this.busyCounter);

    try {
      const result: FetchTransactionsResponse = await this.downloadTransactions(
        address,
        0,
        this.downloadInitialSize,
      );
      console.log(
        `Processing initial download(size = ${this.downloadInitialSize}) for: ${address}`,
      );

      const itemsz: number = result.transactions.length;

      let existingData: T | null = null;

      if (itemsz > this.downloadInitialSize / 4) {
        for (let i = Math.floor(itemsz / 4); i < itemsz - Math.floor(itemsz / 4); i++) {
          const item: TransactionItem = result.transactions[i];

          existingData = await this.dataService.getExistingData(item, address);
          if (existingData) {
            break;
          }
        }
      }

      console.log('Add bunch of data');
      await this.dataService.addData(address, result.transactions, this.db);
      const downloadStatus: string =
        (await this.getDownloadStatus(address, this.db))?.status || 'false';
      if (existingData && downloadStatus === 'true') {
        console.log(`Found existing boxId in db for ${address}, no need to download more.`);
      } else if (itemsz >= this.downloadInitialSize) {
        await this.setDownloadStatus(address, 'false', this.db);
        console.log(`Downloading all tx's for : ${address}`);
        await this.downloadAllForAddress(address, 0, this.db);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.decreaseBusyCounter();
      console.log(this.busyCounter);
    }
  }
}
