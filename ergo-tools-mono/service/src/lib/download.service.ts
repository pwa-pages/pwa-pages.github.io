

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
    private downloadStatusIndexedDbService: DownloadStatusIndexedDbService<T> | null,
  ) {
    this.downloadFullSize = downloadFullSize;
    this.downloadInitialSize = downloadInitialSize;
  }

  async fetchTransactions(url: string): Promise<FetchTransactionsResponse> {
    try {
      const response: Response = await fetch(url);
      if (!response.ok)
        throw new Error(`Server returned code: ${response.status}`);
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
    useNode: boolean,
  ): Promise<FetchTransactionsResponse> {
    if (useNode) {
      const url = `https://${rs_ErgoNodeHost}/blockchain/transaction/byAddress?offset=${offset}&limit=${limit}`;
      console.log(`Downloading from: ${url}`);

      const response: Response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: address,
      });
      if (!response.ok)
        throw new Error(`Server returned code: ${response.status}`);
      const data = (await response.json()) as FetchTransactionsResponse;

      const result: FetchTransactionsResponse = {
        transactions: data.items,
        total: data.total,
        items: [],
      };

      for (const item of data.items) {
        const inputDate: Date = new Date(item.timestamp);
        if (inputDate < rs_StartFrom) {
          return result;
        }
      }

      return result;
    } else {
      const url = `https://${rs_ErgoExplorerHost}/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;
      console.log(`Downloading from: ${url}`);

      const response: FetchTransactionsResponse =
        await this.fetchTransactions(url);
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
  }

  async downloadForAddresses(): Promise<void> {
    console.log('Start downloading for all addresses');

    try {
      const addresses: Address[] =
        await this.dataService.storageService.getData<Address>(rs_AddressDataStoreName) as Address[];

      const downloadPromises: Promise<void>[] = addresses.map(
        async (addressObj: Address) => {
          await this.downloadForAddress(addressObj.address, true);
        },
      );

      await Promise.all(downloadPromises);
    } catch (e) {
      console.error('Error downloading for addresses:', e);
    } finally {
      console.log('End downloading for all addresses');
    }
  }



  // Busy Counter
  private increaseBusyCounter(address: string): void {
    if (this.busyCounter === 0) {
      this.eventSender?.sendEvent({
        type: 'StartFullDownload',
        data: address,
      });
    }
    this.busyCounter++;
  }

  private decreaseBusyCounter(address: string): void {
    this.busyCounter--;
    if (this.busyCounter === 0) {
      this.eventSender?.sendEvent({
        type: 'EndFullDownload',
        data: address,
      });
    }
  }

  // Download All for Address (recursive)
  async downloadAllForAddress(
    address: string,
    offset: number,
    useNode: boolean,
    callback?: () => Promise<void>,
  ): Promise<void> {
    this.increaseBusyCounter(address);
    console.log(this.busyCounter);

    try {
      const result: FetchTransactionsResponse = await this.downloadTransactions(
        address,
        offset,
        this.downloadFullSize + 10,
        useNode,
      );
      console.log(
        `Processing full download(offset = ${offset}, size = ${this.downloadFullSize}) for: ${address}`,
      );

      //const t = this.processItems(result.transactions);
      //console.log('permit amount ' + t);

      if (
        !result.transactions ||
        result.transactions.length === 0 ||
        offset > 100000
      ) {
        await this.downloadStatusIndexedDbService?.setDownloadStatus(address, 'true');
        console.log(this.busyCounter);
        return;
      }

      await this.dataService.addData(address, result.transactions);
      if (callback) {
        await callback?.();
      }

      //await this.dataService.compressInputs();

      if (
        this.dataService.getMaxDownloadDateDifference() >
        new Date().getTime() -
        new Date(
          result.transactions[result.transactions.length - 1].timestamp,
        ).getTime()
      ) {
        await this.downloadAllForAddress(
          address,
          offset + this.downloadFullSize,
          useNode,
        );
      } else {
        await this.downloadStatusIndexedDbService?.setDownloadStatus(address, 'true');
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.decreaseBusyCounter(address);

      console.log(this.busyCounter);
    }
  }

  async downloadForAddress(
    address: string,
    useNode: boolean,
    callback?: () => Promise<void>,
  ): Promise<void> {
    this.increaseBusyCounter(address);
    console.log(this.busyCounter);

    try {
      const result: FetchTransactionsResponse = await this.downloadTransactions(
        address,
        0,
        this.downloadInitialSize,
        useNode,
      );
      console.log(
        `Processing initial download(size = ${this.downloadInitialSize}) for: ${address}`,
      );

      const itemsz: number = result.transactions.length;

      let existingData: T | null = null;

      if (itemsz > this.downloadInitialSize / 4) {
        for (
          let i = Math.floor(itemsz / 4);
          i < itemsz - Math.floor(itemsz / 4);
          i++
        ) {
          const item: TransactionItem = result.transactions[i];

          existingData = await this.dataService.getExistingData(item, address);
          if (existingData) {
            break;
          }
        }
      }

      console.log('Add bunch of data');
      await this.dataService.addData(address, result.transactions);

      if (callback) {
        await callback?.();
      }

      const downloadStatus: string =
        (await this.downloadStatusIndexedDbService?.getDownloadStatus(address))?.status || 'false';
      if (existingData && downloadStatus === 'true') {
        console.log(
          `Found existing boxId in db for ${address}, no need to download more.`,
        );
      } else if (itemsz >= this.downloadInitialSize) {
        await this.downloadStatusIndexedDbService?.setDownloadStatus(address, 'false');
        console.log(`Downloading all tx's for : ${address}`);
        await this.downloadAllForAddress(
          address,
          0,
          useNode,
          callback,
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.decreaseBusyCounter(address);
      this.dataService.purgeData();
      console.log(this.busyCounter);
    }
  }


  
}


if (typeof window !== 'undefined') {
  (window as any).DownloadService = DownloadService;
}

(globalThis as any).CreateActivePermitsDownloadService = (
    eventSender: EventSender
  ): DownloadService<PermitTx> => {

    var storageService = new MemoryStorageService<PermitTx>();
    const activepermitsDataService: ActivePermitsDataService =
      new ActivePermitsDataService(storageService);

    return new DownloadService<PermitTx>(
        rs_FullDownloadsBatchSize,
        rs_InitialNDownloads,
        activepermitsDataService,
        eventSender,
        null,
      );

  };



