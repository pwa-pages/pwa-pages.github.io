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
                    .filter((asset) => asset.tokenId == rs_RSNTokenId || asset.tokenId == rs_eRSNTokenId)
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
    async addData(address, transactions, db) {
        return new Promise((resolve, reject) => {
            // Create a temporary array to hold DbInput items before bulk insertion
            const tempData = [];
            // Populate tempData with processed inputs
            transactions.forEach((item) => {
                item.inputs.forEach((input) => {
                    input.outputAddress = address;
                    input.inputDate = new Date(item.timestamp);
                    input.assets = input.assets.filter((a) => a.tokenId == rs_RSNTokenId || a.tokenId == rs_eRSNTokenId);
                    input.assets.forEach((asset) => {
                        if (asset.tokenId && rs_TokenIdMap[asset.tokenId]) {
                            asset.name = rs_TokenIdMap[asset.tokenId];
                            asset.decimals = rs_RSNDecimals;
                        }
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
                    data: inputs,
                });
                this.eventSender.sendEvent({
                    type: 'AddressChartChanged',
                    data: await this.chartService.getAddressCharts(inputs),
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
