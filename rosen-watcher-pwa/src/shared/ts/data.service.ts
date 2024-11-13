interface DownloadStatus {
  address: string;
  status: string;
}

interface Asset {
  // Define the structure of an asset here
  // Example properties:
  id: string;
  name: string;
  quantity: number;
  amount: number;
  decimals: number;
  tokenId: string | null;
}

interface DbInput {
  outputAddress: string;
  inputDate: Date;
  boxId: string;
  assets: Asset[]; // Replace with actual Asset structure
  address?: string;
  chainType?: string;
}

interface Input {
  boxId: string;
  outputAddress: string;
  inputDate: Date;
  assets: Asset[]; // Replace with actual Asset structure
  address: string;
  amount?: number;
  accumulatedAmount?: number;
  chainType?: ChainType | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DataService {
  constructor(
    public db: IDBDatabase,
    private chartService: ChartService,
  ) {}

  async getWatcherInputs(db: IDBDatabase): Promise<Input[]> {
    const inputsPromise = this.getData<Input>(rs_InputsStoreName, db);

    try {
      const inputs = await inputsPromise;

      const result_1 = inputs.filter(
        (i: Input) => i.chainType != null || getChainType(i.address) != null,
      );

      result_1.forEach((input: Input) => {
        input.assets = input.assets
          .filter((asset: Asset) => asset.name === 'RSN' || asset.name === 'eRSN')
          .map((asset_1: Asset) => {
            return asset_1;
          });
      });

      return await new Promise<Input[]>((resolve) => {
        resolve(result_1);
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  // Add Data to IndexedDB
  async addData(address: string, transactions: TransactionItem[], db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = db.transaction([rs_InputsStoreName], 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(rs_InputsStoreName);

      const putPromises: Promise<void>[] = transactions.flatMap((item: TransactionItem) =>
        item.inputs.map((input: Input) => {
          input.outputAddress = address;
          input.inputDate = new Date(item.timestamp);

          input.assets = input.assets.filter((a) => a.name == 'eRSN' || a.name == 'RSN');
          input.assets.forEach((a) => {
            a.tokenId = null;
          });

          const dbInput: DbInput = {
            outputAddress: input.outputAddress,
            inputDate: input.inputDate,
            boxId: input.boxId /*.slice(0, 12)*/,
            assets: input.assets || [],
            chainType: getChainType(input.address) as ChainType,
          };

          return new Promise<void>((putResolve, putReject) => {
            if (dbInput.assets.length > 0) {
              const request: IDBRequest = objectStore.put(dbInput);
              request.onsuccess = () => putResolve();
              request.onerror = (event: Event) => putReject((event.target as IDBRequest).error);
            } else {
              putResolve();
            }
          });
        }),
      );

      Promise.all(putPromises)
        .then(async () => {
          const inputs = await this.getSortedInputs();
          sendMessageToClients({ type: 'InputsChanged', data: inputs });
          sendMessageToClients({
            type: 'AddressChartChanged',
            data: await this.chartService.getAddressCharts(inputs),
          });
          resolve();
        })
        .catch(reject);
    });
  }

  // Get Data from IndexedDB
  async getData<T>(storeName: string, db: IDBDatabase): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = db.transaction([storeName], 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore(storeName);
      const request: IDBRequest = objectStore.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }

  // Get Download Status for Address from IndexedDB
  async getDownloadStatus(address: string, db: IDBDatabase): Promise<string> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = db.transaction([rs_DownloadStatusStoreName], 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore(rs_DownloadStatusStoreName);
      const request: IDBRequest = objectStore.get(address);

      request.onsuccess = () => resolve((request.result as DownloadStatus)?.status || 'false');
      request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }

  // Set Download Status for Address in IndexedDB
  async setDownloadStatus(address: string, status: string, db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = db.transaction([rs_DownloadStatusStoreName], 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(rs_DownloadStatusStoreName);
      const Address = address;
      const request: IDBRequest = objectStore.put({ Address, address, status });

      request.onsuccess = () => resolve();
      request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }

  // Get Data by BoxId from IndexedDB
  async getDataByBoxId(boxId: string, addressId: string, db: IDBDatabase): Promise<DbInput | null> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = db.transaction([rs_InputsStoreName], 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore(rs_InputsStoreName);
      const request: IDBRequest = objectStore.get([
        boxId,
        addressId,
      ]); /* ?? objectStore.get([boxId.slice(0, 12), addressId])*/

      request.onsuccess = () => {
        const result: DbInput | undefined = request.result as DbInput | undefined;
        if (!result || result.outputAddress !== addressId) {
          resolve(null);
        } else {
          resolve(result);
        }
      };

      request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }

  async getSortedInputs(): Promise<Input[]> {
    const inputsPromise = await this.getWatcherInputs(this.db);
    let amount = 0;
    const sortedInputs: Input[] = [];
    console.log('start retrieving chart from database');
    try {
      const inputs = await inputsPromise;

      inputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());

      inputs.forEach((input: Input) => {
        input.assets.forEach((asset: Asset) => {
          amount += asset.amount;
          sortedInputs.push({
            inputDate: input.inputDate,
            address: input.address,
            assets: input.assets,
            outputAddress: input.outputAddress,
            boxId: input.boxId,
            accumulatedAmount: amount,
            amount: asset.amount / Math.pow(10, asset.decimals),
            chainType: input.chainType ?? getChainType(input.address),
          });
        });
      });
      console.log('done retrieving chart from database ' + inputs.length + ' inputs');
      return await new Promise<Input[]>((resolve) => {
        resolve(sortedInputs);
      });
    } catch (error) {
      console.error(error);
      return sortedInputs;
    }
  }
}
