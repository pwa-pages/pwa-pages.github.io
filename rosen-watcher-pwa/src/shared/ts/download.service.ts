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
  status: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DownloadService<T> {
  private busyCounter = 0;
  private downloadFullSize = rs_FullDownloadsBatchSize;
  private downloadInitialSize = rs_InitialNDownloads;
  constructor(
    downloadFullSize: number,
    downloadInitialSize: number,
    private dataService: DataService<T>,
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
    profile: string | undefined,
  ): Promise<FetchTransactionsResponse> {
    const url = `https://api.ergoplatform.com/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;
    console.log(`Downloading from: ${url}`);

    sendMessageToClients({ type: 'StartDownload', profile: profile });

    const response: FetchTransactionsResponse = await this.fetchTransactions(url);
    const result: FetchTransactionsResponse = {
      transactions: response.items,
      total: response.total,
      items: [],
    };

    for (const item of response.items) {
      const inputDate: Date = new Date(item.timestamp);
      if (inputDate < rs_StartFrom) {
        sendMessageToClients({ type: 'EndDownload', profile: profile });
        return result;
      }
    }

    sendMessageToClients({ type: 'EndDownload', profile: profile });
    return result;
  }

  async downloadForAddresses(profile: string | undefined): Promise<void> {
    try {
      const addresses: AddressData[] =
        await this.dataService.getData<AddressData>(rs_AddressDataStoreName);

      const downloadPromises: Promise<void>[] = addresses.map(async (addressObj: AddressData) => {
        await this.downloadForAddress(addressObj.address, profile);
      });

      await Promise.all(downloadPromises);
    } catch (e) {
      console.error('Error downloading for addresses:', e);
    }
  }

  // Busy Counter
  private increaseBusyCounter(profile: string | undefined): void {
    if (this.busyCounter === 0) {
      sendMessageToClients({ type: 'StartFullDownload', profile: profile });
    }
    this.busyCounter++;
  }

  private decreaseBusyCounter(profile: string | undefined): void {
    this.busyCounter--;
    if (this.busyCounter === 0) {
      sendMessageToClients({ type: 'EndFullDownload', profile: profile });
    }
  }

  // Download All for Address (recursive)
  async downloadAllForAddress(
    address: string,
    offset: number,
    db: IDBDatabase,
    profile: string | undefined,
  ): Promise<void> {
    this.increaseBusyCounter(profile);
    console.log(this.busyCounter);

    try {
      const result: FetchTransactionsResponse = await this.downloadTransactions(
        address,
        offset,
        this.downloadFullSize + 10,
        profile,
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

      await this.dataService.addData(address, result.transactions, db, profile);
      //await this.dataService.compressInputs();

      if (
        this.dataService.getMaxDownloadDateDifference() >
        new Date().getTime() -
          new Date(result.transactions[result.transactions.length - 1].timestamp).getTime()
      ) {
        await this.downloadAllForAddress(address, offset + this.downloadFullSize, db, profile);
      } else {
        await this.setDownloadStatus(address, 'true', db);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.decreaseBusyCounter(profile);
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
  async getDownloadStatus(address: string, db: IDBDatabase): Promise<string> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = db.transaction([rs_DownloadStatusStoreName], 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore(rs_DownloadStatusStoreName);
      const request: IDBRequest = objectStore.get(address + '_' + this.dataService.getDataType());

      request.onsuccess = () => resolve((request.result as DownloadStatus)?.status || 'false');
      request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }

  // Set Download Status for Address in IndexedDB
  async setDownloadStatus(address: string, status: string, db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = db.transaction([rs_DownloadStatusStoreName], 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(rs_DownloadStatusStoreName);
      address = address + '_' + this.dataService.getDataType();
      const Address = address;
      const request: IDBRequest = objectStore.put({ Address, address, status });

      request.onsuccess = () => resolve();
      request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }

  async downloadForAddress(address: string, profile: string | undefined): Promise<void> {
    this.increaseBusyCounter(profile);
    console.log(this.busyCounter);

    try {
      const result: FetchTransactionsResponse = await this.downloadTransactions(
        address,
        0,
        this.downloadInitialSize,
        profile,
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
      await this.dataService.addData(address, result.transactions, this.db, profile);

      const downloadStatus: string = await this.getDownloadStatus(address, this.db);
      if (existingData && downloadStatus === 'true') {
        console.log(`Found existing boxId in db for ${address}, no need to download more.`);
      } else if (itemsz >= this.downloadInitialSize) {
        await this.setDownloadStatus(address, 'false', this.db);
        console.log(`Downloading all tx's for : ${address}`);
        await this.downloadAllForAddress(address, 0, this.db, profile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.decreaseBusyCounter(profile);
      console.log(this.busyCounter);
    }
  }
}
