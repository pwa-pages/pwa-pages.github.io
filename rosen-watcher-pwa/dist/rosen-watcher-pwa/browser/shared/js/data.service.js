// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DataService {
    db;
    chartService;
    constructor(db, chartService) {
        this.db = db;
        this.chartService = chartService;
    }
    async getWatcherInputs(db) {
        const inputsPromise = this.getData(rs_InputsStoreName, db);
        try {
            const inputs = await inputsPromise;
            const result_1 = inputs.filter((i) => i.chainType != null || getChainType(i.address) != null);
            result_1.forEach((input) => {
                input.assets = input.assets
                    .filter((asset) => asset.name === 'RSN' || asset.name === 'eRSN')
                    .map((asset_1) => {
                    return asset_1;
                });
            });
            return await new Promise((resolve) => {
                resolve(result_1);
            });
        }
        catch (error) {
            console.error(error);
            return [];
        }
    }
    async addData(address, transactions, db) {
        return new Promise((resolve, reject) => {
            // Create a temporary array to hold DbInput items before bulk insertion
            const tempData = [];
            // Populate tempData with processed inputs
            transactions.forEach((item) => {
                item.inputs.forEach((input) => {
                    input.outputAddress = address;
                    input.inputDate = new Date(item.timestamp);
                    // Filter and modify assets based on the specified conditions
                    input.assets = input.assets.filter((a) => a.name === 'eRSN' || a.name === 'RSN');
                    input.assets.forEach((a) => {
                        a.tokenId = null;
                    });
                    // Create a DbInput item and add it to the temporary array if it meets the criteria
                    const dbInput = {
                        outputAddress: input.outputAddress,
                        inputDate: input.inputDate,
                        boxId: input.boxId,
                        assets: input.assets || [],
                        chainType: getChainType(input.address),
                    };
                    if (dbInput.assets.length > 0) {
                        tempData.push(dbInput);
                    }
                });
            });
            // Start a new transaction to add all items in tempData to the database
            const transaction = db.transaction([rs_InputsStoreName], 'readwrite');
            const objectStore = transaction.objectStore(rs_InputsStoreName);
            // Convert each DbInput item in tempData into a database put request
            const putPromises = tempData.map((dbInput) => {
                return new Promise((putResolve, putReject) => {
                    const request = objectStore.put(dbInput);
                    request.onsuccess = () => putResolve();
                    request.onerror = (event) => putReject(event.target.error);
                });
            });
            // Resolve all put operations and then update clients
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
    async getData(storeName, db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }
    // Get Download Status for Address from IndexedDB
    async getDownloadStatus(address, db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([rs_DownloadStatusStoreName], 'readonly');
            const objectStore = transaction.objectStore(rs_DownloadStatusStoreName);
            const request = objectStore.get(address);
            request.onsuccess = () => resolve(request.result?.status || 'false');
            request.onerror = (event) => reject(event.target.error);
        });
    }
    // Set Download Status for Address in IndexedDB
    async setDownloadStatus(address, status, db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([rs_DownloadStatusStoreName], 'readwrite');
            const objectStore = transaction.objectStore(rs_DownloadStatusStoreName);
            const Address = address;
            const request = objectStore.put({ Address, address, status });
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
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
        const inputsPromise = await this.getWatcherInputs(this.db);
        let amount = 0;
        const sortedInputs = [];
        console.log('start retrieving chart from database');
        try {
            const inputs = await inputsPromise;
            inputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());
            inputs.forEach((input) => {
                input.assets.forEach((asset) => {
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
