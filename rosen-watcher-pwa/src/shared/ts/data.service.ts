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

  async getWatcherInputs(db: IDBDatabase): Promise<DbInput[]> {
    const inputsPromise = this.getData<DbInput>(rs_InputsStoreName, db);

    try {
      const inputs = await inputsPromise;

      const filteredInputs = inputs.filter(
        (i: DbInput) => i.chainType != null || getChainType(i.address) != null,
      );

      filteredInputs.forEach((input: DbInput) => {
        input.assets = input.assets
          .filter((asset: Asset) => asset.name === 'RSN' || asset.name === 'eRSN')
          .map((asset_1: Asset) => {
            return asset_1;
          });
      });
      filteredInputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());

      return await new Promise<DbInput[]>((resolve) => {
        resolve(filteredInputs);
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  /*
  async compressInputs(db: IDBDatabase) : Promise<void>{

    var existingInputs = await this.getWatcherInputs(db);
    var compressedInputs: Map<Date, DbInput> = new Map();
    


    existingInputs.forEach((input: DbInput) => {

      input.inputDate = this.convertDbInputDateForCompression(input.inputDate);

      var existingInput = compressedInputs.get(input.inputDate);
      if(existingInput){
        if(!existingInput.ass)
      }
      else{
        compressedInputs.set(input.inputDate, input);
      }

    });

  }
  
  convertDbInputDateForCompression(dt: Date){
    const currentDate = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(currentDate.getMonth() - 2);

    if(dt < twoMonthsAgo){
      var day = dt.getDate() - dt.getDay();
      dt.setDate(day);
    }
    dt.setHours(0, 0, 0, 0); 
    return dt;
  }
  
*/
  async addData(address: string, transactions: TransactionItem[], db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create a temporary array to hold DbInput items before bulk insertion
      const tempData: DbInput[] = [];

      // Populate tempData with processed inputs
      transactions.forEach((item: TransactionItem) => {
        item.inputs.forEach((input: Input) => {
          input.outputAddress = address;
          input.inputDate = new Date(item.timestamp);

          input.assets = input.assets.filter((a) => a.name === 'eRSN' || a.name === 'RSN');
          input.assets.forEach((a) => {
            a.tokenId = null;
          });

          const dbInput: DbInput = {
            outputAddress: input.outputAddress,
            inputDate: input.inputDate,
            boxId: input.boxId,
            assets: input.assets || [],
            chainType: getChainType(input.address) as ChainType,
          };

          if (dbInput.chainType && dbInput.assets.length > 0) {
            tempData.push(dbInput);
          }
        });
      });

      const transaction: IDBTransaction = db.transaction([rs_InputsStoreName], 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(rs_InputsStoreName);

      const putPromises = tempData.map((dbInput: DbInput) => {
        return new Promise<void>((putResolve, putReject) => {
          const request: IDBRequest = objectStore.put(dbInput);
          request.onsuccess = () => putResolve();
          request.onerror = (event: Event) => putReject((event.target as IDBRequest).error);
        });
      });

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

      inputs.forEach((input: DbInput) => {
        input.assets.forEach((asset: Asset) => {
          amount += asset.amount;
          sortedInputs.push({
            inputDate: input.inputDate,
            address: input.address ?? '',
            assets: input.assets,
            outputAddress: input.outputAddress,
            boxId: input.boxId,
            accumulatedAmount: amount,
            amount: asset.amount / Math.pow(10, asset.decimals),
            chainType: (input.chainType as ChainType) ?? getChainType(input.address),
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
  /*
  async compressInputs(): Promise<void> {
    const dbInputs = await this.getWatcherInputs(this.db);
    let amount = 0;
    const sortedInputs: Input[] = [];
    console.log('start retrieving chart from database');
    try {
      const inputs = await dbInputs;

      inputs.forEach((input: DbInput) => {
        input.assets.forEach((asset: Asset) => {
          
          sortedInputs.push({
            inputDate: input.inputDate,
            address: input.address ?? '',
            assets: input.assets,
            outputAddress: input.outputAddress,
            boxId: input.boxId,
            accumulatedAmount: amount,
            amount: asset.amount / Math.pow(10, asset.decimals),
            chainType: (input.chainType as ChainType) ?? getChainType(input.address),
          });
        });
      });
      
      
    } catch (error) {
      console.error(error);
    }
  }
    */
}
