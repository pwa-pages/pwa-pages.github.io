// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RewardDataService extends DataService {
    db;
    chartService;
    eventSender;
    async getExistingData(transaction, address) {
        for (const input of transaction.inputs) {
            if (input.boxId && getChainType(input.address)) {
                const data = await this.getDataByBoxId(input.boxId, address, this.db);
                if (data) {
                    return data;
                }
            }
        }
        return null;
    }
    constructor(db, chartService, eventSender) {
        super(db);
        this.db = db;
        this.chartService = chartService;
        this.eventSender = eventSender;
    }
    getDataType() {
        return 'reward';
    }
    async getWatcherInputs() {
        const inputsPromise = this.getData(rs_InputsStoreName);
        console.log('Retrieving watcher inputs and such');
        try {
            const inputs = await inputsPromise;
            const filteredInputs = inputs.filter((i) => i.chainType != null || getChainType(i.address) != null);
            filteredInputs.forEach((input) => {
                input.assets = input.assets
                    .filter((asset) => asset.name === 'RSN' || asset.name === 'eRSN')
                    .map((asset_1) => {
                    return asset_1;
                });
            });
            filteredInputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());
            return await new Promise((resolve) => {
                resolve(filteredInputs);
            });
        }
        catch (error) {
            console.error(error);
            return [];
        }
    }
    /*
    async compressInputs(): Promise<void> {
      const existingInputs = await this.getWatcherInputs(this.db);
      const transaction: IDBTransaction = this.db.transaction([rs_InputsStoreName], 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(rs_InputsStoreName);
      objectStore.clear();
  
      const addresses = Array.from(new Set(existingInputs.map((e) => e.outputAddress)));
  
      addresses.forEach((a) => {
        this.compressChainInputs(
          existingInputs.filter((e) => e.outputAddress == a),
          objectStore,
        );
      });
    }
  
    private compressChainInputs(existingInputs: DbInput[], objectStore: IDBObjectStore) {
      const compressedInputs = new Map<number, DbInput>();
  
      let notCompressabeInputs = [];
  
      if (existingInputs.length > rs_InitialNDownloads) {
        notCompressabeInputs = existingInputs.slice(
          existingInputs.length - rs_InitialNDownloads,
          existingInputs.length,
        );
        existingInputs = existingInputs.slice(0, existingInputs.length - rs_InitialNDownloads);
      } else {
        existingInputs.forEach((dbInput: DbInput) => {
          objectStore.put(dbInput);
        });
        return;
      }
  
      existingInputs.forEach((existingInput: DbInput) => {
        const currentDate = new Date();
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(currentDate.getMonth() - 2);
  
        const input = {
          outputAddress: existingInput.outputAddress,
          inputDate: existingInput.inputDate,
          boxId: existingInput.boxId,
          address: existingInput.address,
          chainType: existingInput.chainType ?? getChainType(existingInput.address),
        } as DbInput;
  
        if (input.inputDate >= twoMonthsAgo) {
          input.assets = existingInput.assets;
          objectStore.put(input);
        } else {
          input.inputDate = this.convertDbInputDateForCompression(input.inputDate);
  
          let compressedInput = compressedInputs.get(input.inputDate.getTime());
  
          if (!compressedInput) {
            compressedInput = input;
          }
  
          if (!compressedInput.assets) {
            compressedInput.assets = [];
          }
  
          existingInput.assets.forEach((a) => {
            if (compressedInput.assets.length == 0) {
              compressedInput.assets.push({
                amount: a.amount,
                decimals: a.decimals,
                tokenId: a.tokenId,
                quantity: a.quantity,
                name: a.name,
              } as Asset);
            } else {
              compressedInput.assets[0].amount += a.amount;
            }
          });
  
          compressedInputs.set(input.inputDate.getTime(), compressedInput);
        }
      });
  
      compressedInputs.forEach((dbInput: DbInput) => {
        objectStore.put(dbInput);
      });
  
      notCompressabeInputs.forEach((dbInput: DbInput) => {
        objectStore.put(dbInput);
      });
    }
  
    convertDbInputDateForCompression(dt: Date) {
      const currentDate = new Date();
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(currentDate.getMonth() - 2);
  
      if (dt < twoMonthsAgo) {
        const day = dt.getDate() - dt.getDay();
        dt.setDate(day);
      }
      dt.setHours(0, 0, 0, 0);
      return dt;
    }*/
    async addData(address, transactions, db, profile) {
        return new Promise((resolve, reject) => {
            // Create a temporary array to hold DbInput items before bulk insertion
            const tempData = [];
            // Populate tempData with processed inputs
            transactions.forEach((item) => {
                item.inputs.forEach((input) => {
                    input.outputAddress = address;
                    input.inputDate = new Date(item.timestamp);
                    input.assets = input.assets.filter((a) => a.name === 'eRSN' || a.name === 'RSN');
                    input.assets.forEach((a) => {
                        a.tokenId = null;
                    });
                    const dbInput = {
                        outputAddress: input.outputAddress,
                        inputDate: input.inputDate,
                        boxId: input.boxId,
                        assets: input.assets || [],
                        chainType: getChainType(input.address),
                    };
                    if (dbInput.chainType && dbInput.assets.length > 0) {
                        tempData.push(dbInput);
                    }
                });
            });
            const transaction = db.transaction([rs_InputsStoreName], 'readwrite');
            const objectStore = transaction.objectStore(rs_InputsStoreName);
            const putPromises = tempData.map((dbInput) => {
                return new Promise((putResolve, putReject) => {
                    const request = objectStore.put(dbInput);
                    request.onsuccess = () => putResolve();
                    request.onerror = (event) => putReject(event.target.error);
                });
            });
            Promise.all(putPromises)
                .then(async () => {
                const inputs = await this.getSortedInputs();
                this.eventSender.sendEvent({
                    type: 'InputsChanged',
                    profile: profile,
                    data: inputs,
                });
                this.eventSender.sendEvent({
                    type: 'AddressChartChanged',
                    data: await this.chartService.getAddressCharts(inputs),
                    profile: profile,
                });
                resolve();
            })
                .catch(reject);
        });
    }
    // Get Data by BoxId from IndexedDB
    async getDataByBoxId(boxId, addressId, db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([rs_InputsStoreName], 'readonly');
            const objectStore = transaction.objectStore(rs_InputsStoreName);
            const request = objectStore.get([
                boxId,
                addressId,
            ]); /* ?? objectStore.get([boxId.slice(0, 12), addressId])*/
            request.onsuccess = () => {
                const result = request.result;
                if (!result || result.outputAddress !== addressId) {
                    resolve(null);
                }
                else {
                    resolve(result);
                }
            };
            request.onerror = (event) => reject(event.target.error);
        });
    }
    async getSortedInputs() {
        const inputsPromise = await this.getWatcherInputs();
        let amount = 0;
        const sortedInputs = [];
        console.log('start retrieving chart from database');
        try {
            const inputs = await inputsPromise;
            inputs.forEach((input) => {
                input.assets.forEach((asset) => {
                    amount += asset.amount;
                    sortedInputs.push({
                        inputDate: input.inputDate,
                        address: input.address ?? '',
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
            return await new Promise((resolve) => {
                resolve(sortedInputs);
            });
        }
        catch (error) {
            console.error(error);
            return sortedInputs;
        }
    }
}
