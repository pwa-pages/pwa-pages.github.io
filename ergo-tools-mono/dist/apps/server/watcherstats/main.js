// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DataService {
    storageService;
    db;
    constructor(dbOrStorage) {
        if (dbOrStorage?.transaction !== undefined) {
            this.db = dbOrStorage;
            this.storageService = new IDBDatabaseStorageService(this.db);
        }
        else {
            this.storageService = dbOrStorage;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async purgeData() {
        // Empty implementation
    }
    getMaxDownloadDateDifference() {
        return 3155760000000;
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ActivePermitsDataService extends DataService {
    maxDownloadDateDifference;
    getData() {
        return this.storageService.getData(rs_ActivePermitTxStoreName);
    }
    async getExistingData(transaction, address) {
        for (const input of transaction.inputs) {
            if (input.boxId) {
                const data = await this.storageService.getDataById(rs_ActivePermitTxStoreName, this.createUniqueId(input.boxId, transaction.id, address));
                if (data) {
                    return data;
                }
            }
        }
        for (const output of transaction.outputs) {
            if (output.boxId) {
                const data = await this.storageService.getDataById(rs_ActivePermitTxStoreName, this.createUniqueId(output.boxId, transaction.id, address));
                if (data) {
                    return data;
                }
            }
        }
        return null;
    }
    constructor(db, maxDownloadDateDifference = 204800000) {
        super(db);
        this.maxDownloadDateDifference = maxDownloadDateDifference;
    }
    createUniqueId(boxId, transactionId, address) {
        const str = `${transactionId}_${boxId}_${address}`;
        let hash = 0, i, chr;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0;
        }
        return hash.toString();
    }
    getDataType() {
        return 'activepermit';
    }
    getMaxDownloadDateDifference() {
        return this.maxDownloadDateDifference;
    }
    async getWatcherPermits() {
        const permitsPromise = this.storageService.getData(rs_ActivePermitTxStoreName);
        console.log('Retrieving watcher active permits');
        try {
            const permits = await permitsPromise;
            permits.forEach((permit) => {
                permit.assets = permit.assets
                    .filter((asset) => asset.tokenId != null && asset.tokenId in rwtTokenIds)
                    .map((asset_1) => {
                    return asset_1;
                });
            });
            permits.sort((a, b) => b.date.getTime() - a.date.getTime());
            return await new Promise((resolve) => {
                resolve(permits);
            });
        }
        catch (error) {
            console.error(error);
            return [];
        }
    }
    async downloadOpenBoxes(chainType) {
        let addresses = [];
        Object.entries(permitBulkAddresses).forEach(([key, address]) => {
            if (key === chainType && address != null) {
                addresses.push(address);
            }
        });
        const downloadPromises = addresses.map(async (address) => {
            let url = 'https://api.ergoplatform.com/api/v1/boxes/unspent/byAddress/' +
                address;
            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`Server returned code: ${response.status}`);
            await this.saveOpenBoxes(address, await response.json());
        });
        await Promise.all(downloadPromises);
    }
    async saveOpenBoxes(address, openBoxesJson) {
        const boxes = {
            address: address,
            openBoxesJson: openBoxesJson,
        };
        await this.storageService.addData(rs_OpenBoxesStoreName, [boxes]);
    }
    async getOpenBoxesMap() {
        const openBoxesMap = {};
        const boxes = this.storageService.getData(rs_OpenBoxesStoreName);
        for (const [, address] of Object.entries(permitBulkAddresses)) {
            if (address) {
                var json = (await boxes).filter(ob => ob.address === address);
                if (json.length != 0) {
                    openBoxesMap[address] = JSON.stringify(json);
                }
                else {
                    openBoxesMap[address] = null;
                }
            }
        }
        return openBoxesMap;
    }
    shouldAddInputToDb(address, assets) {
        return ((address != null && address.length <= 100 && assets.length > 0) ||
            Object.values(permitTriggerAddresses).includes(address));
    }
    shouldAddOutputToDb(address) {
        return (Object.values(permitBulkAddresses).includes(address) ||
            Object.values(permitTriggerAddresses).includes(address) ||
            Object.values(rewardAddresses).includes(address));
    }
    async getAdressPermits(activeOnly, frommonth, fromyear, tomonth, toyear, addresses = null) {
        const permits = await this.getWatcherPermits();
        const openBoxesMap = await this.getOpenBoxesMap();
        let addressPermits = new Array();
        if (addresses != null && addresses.length > 0) {
            addressPermits = permits.filter((info) => addresses.some((addr) => addr === info.address));
        }
        if (activeOnly === false) {
            addressPermits = permits;
        }
        let result = new Array();
        const permitsByTxId = {};
        for (const permit of permits) {
            if (!permitsByTxId[permit.transactionId]) {
                permitsByTxId[permit.transactionId] = [];
            }
            permitsByTxId[permit.transactionId].push(permit);
        }
        const boxIdMap = {};
        for (const permit of permits) {
            if (!boxIdMap[permit.boxId]) {
                boxIdMap[permit.boxId] = [];
            }
            boxIdMap[permit.boxId].push(permit);
        }
        var permitBulkAddressSet = new Set(Object.values(permitBulkAddresses));
        for (const permit of addressPermits) {
            let outputs = (permitsByTxId[permit.transactionId] ?? []).filter((o) => Object.values(permitTriggerAddresses).some((address) => address === o.address));
            let foundResolved = false;
            for (const output of outputs) {
                let cnt = boxIdMap[output.boxId] ?? [];
                if (cnt.length >= 2) {
                    foundResolved = true;
                    if (activeOnly) {
                        for (const p of cnt) {
                            let txs = permitsByTxId[p.transactionId]?.filter((t) => permitBulkAddressSet.has(t.address)) ?? [];
                            txs.map(async (t) => {
                                let openBoxes = openBoxesMap[t.address];
                                if (openBoxes && openBoxes.indexOf(t.boxId) !== -1) {
                                    if (!result.some((r) => r.boxId === t.boxId)) {
                                        result.push(permit);
                                    }
                                }
                            });
                        }
                    }
                    else {
                        for (const p of cnt) {
                            let txs = permitsByTxId[p.transactionId]?.filter((t) => permitBulkAddressSet.has(t.address)) ?? [];
                            txs.map(t => {
                                const d0 = new Date(t.date);
                                if (frommonth != null && fromyear != null && tomonth != null && toyear != null) {
                                    if ((d0.getFullYear() > fromyear || (d0.getMonth() + 1 >= frommonth && d0.getFullYear() == fromyear))
                                        &&
                                            (d0.getFullYear() < toyear || (d0.getMonth() + 1 <= tomonth && d0.getFullYear() == toyear))) {
                                        result.push(permit);
                                    }
                                }
                                else {
                                    result.push(permit);
                                }
                            });
                        }
                    }
                }
            }
            if (foundResolved === false) {
                result.push(permit);
            }
        }
        const seen = new Set();
        const filteredResult = result.filter((r) => {
            if (seen.has(r.transactionId))
                return false;
            seen.add(r.transactionId);
            return true;
        });
        return filteredResult;
    }
    async addData(address, transactions) {
        const tempData = [];
        const now = Date.now();
        let maxDiff = this.getMaxDownloadDateDifference();
        transactions.forEach((item) => {
            item.inputs.forEach((input) => {
                if (this.shouldAddInputToDb(input.address, input.assets) === false) {
                    return;
                }
                input.inputDate = new Date(item.timestamp);
                input.assets = input.assets.filter((a) => a.tokenId != null && a.tokenId in rwtTokenIds);
                const permitTx = {
                    id: this.createUniqueId(input.boxId, item.id, address),
                    address: input.address,
                    date: input.inputDate,
                    boxId: input.boxId,
                    assets: input.assets || [],
                    wid: '',
                    chainType: getChainTypeForPermitAddress(address),
                    transactionId: item.id,
                };
                if (permitTx != null && permitTx.date && now - new Date(permitTx.date).getTime() <= maxDiff * 2) {
                    tempData.push(permitTx);
                }
            });
            item.outputs.forEach((output) => {
                if (this.shouldAddOutputToDb(output.address) === false) {
                    return;
                }
                output.outputDate = new Date(item.timestamp);
                output.assets = output.assets.filter((a) => a.tokenId != null && a.tokenId in rwtTokenIds);
                output.assets.forEach((a) => {
                    a.amount = -a.amount;
                });
                const permitTx = {
                    id: this.createUniqueId(output.boxId, item.id, address),
                    address: output.address,
                    date: output.outputDate,
                    boxId: output.boxId,
                    assets: output.assets || [],
                    wid: '',
                    chainType: getChainTypeForPermitAddress(address),
                    transactionId: item.id,
                };
                if (permitTx != null && permitTx.date && now - new Date(permitTx.date).getTime() <= maxDiff * 2) {
                    tempData.push(permitTx);
                }
            });
        });
        await this.storageService.addData(rs_ActivePermitTxStoreName, tempData);
    }
    async purgeData() {
        let permitTxs = await this.storageService.getData(rs_ActivePermitTxStoreName);
        permitTxs = (await permitTxs).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let permitTx = null;
        if (permitTxs.length >= rs_FullDownloadsBatchSize) {
            permitTx = permitTxs[rs_FullDownloadsBatchSize - 1];
        }
        else {
            permitTx = permitTxs[permitTxs.length - 1];
        }
        let maxDiff = this.getMaxDownloadDateDifference();
        const now = Date.now();
        if (permitTx != null && now - permitTx.date.getTime() > maxDiff) {
            maxDiff = now - permitTx.date.getTime();
        }
        var purgePermitTxs = [];
        for (const permitTx of permitTxs) {
            if (permitTx.date &&
                now - new Date(permitTx.date).getTime() > maxDiff) {
                purgePermitTxs.push(permitTx);
            }
        }
        await this.storageService.deleteData(rs_ActivePermitTxStoreName, purgePermitTxs.map(pt => pt.id));
    }
    async getSortedPermits() {
        const permitsPromise = await this.getWatcherPermits();
        const sortedPermits = [];
        console.log('start retrieving permits from database');
        try {
            const permits = await permitsPromise;
            permits.forEach((permitTx) => {
                sortedPermits.push({
                    id: permitTx.id,
                    date: permitTx.date,
                    address: permitTx.address,
                    assets: permitTx.assets,
                    wid: permitTx.wid,
                    boxId: permitTx.boxId,
                    transactionId: permitTx.transactionId,
                    chainType: permitTx.chainType ??
                        getChainTypeForPermitAddress(permitTx.address),
                });
            });
            console.log('done retrieving permits from database ' + permits.length + ' permits');
            return await new Promise((resolve) => {
                resolve(sortedPermits);
            });
        }
        catch (error) {
            console.error(error);
            return sortedPermits;
        }
    }
}
globalThis.GetWatcherDataService = (activePermitsDataService) => {
    return new WatcherDataService(activePermitsDataService);
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DownloadService {
    dataService;
    eventSender;
    downloadStatusIndexedDbService;
    busyCounter = 0;
    downloadFullSize = rs_FullDownloadsBatchSize;
    downloadInitialSize = rs_InitialNDownloads;
    //private static addressDownloadDateMap = new Map<string, Date>();
    constructor(downloadFullSize, downloadInitialSize, dataService, eventSender, downloadStatusIndexedDbService) {
        this.dataService = dataService;
        this.eventSender = eventSender;
        this.downloadStatusIndexedDbService = downloadStatusIndexedDbService;
        this.downloadFullSize = downloadFullSize;
        this.downloadInitialSize = downloadInitialSize;
    }
    getDataService() {
        return this.dataService;
    }
    async fetchTransactions(url) {
        try {
            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`Server returned code: ${response.status}`);
            return (await response.json());
        }
        catch (error) {
            console.error(`An error occurred: ${error}`);
            throw error;
        }
    }
    async downloadTransactions(address, offset = 0, limit = 500, useNode) {
        if (useNode) {
            const url = `${rs_ErgoNodeHost}/blockchain/transaction/byAddress?offset=${offset}&limit=${limit}`;
            console.log(`Downloading from: ${url}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: address,
            });
            if (!response.ok)
                throw new Error(`Server returned code: ${response.status}`);
            const data = (await response.json());
            const result = {
                transactions: data.items,
                total: data.total,
                items: [],
            };
            for (const item of data.items) {
                const inputDate = new Date(item.timestamp);
                if (inputDate < rs_StartFrom) {
                    return result;
                }
            }
            return result;
        }
        else {
            const url = `https://${rs_ErgoExplorerHost}/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;
            console.log(`Downloading from: ${url}`);
            const response = await this.fetchTransactions(url);
            const result = {
                transactions: response.items,
                total: response.total,
                items: [],
            };
            for (const item of response.items) {
                const inputDate = new Date(item.timestamp);
                if (inputDate < rs_StartFrom) {
                    return result;
                }
            }
            return result;
        }
    }
    async downloadForAddresses() {
        console.log('Start downloading for all addresses');
        try {
            const addresses = await this.dataService.storageService.getData(rs_AddressDataStoreName);
            const downloadPromises = addresses.map(async (addressObj) => {
                await this.downloadForAddress(addressObj.address, true);
            });
            await Promise.all(downloadPromises);
        }
        catch (e) {
            console.error('Error downloading for addresses:', e);
        }
        finally {
            console.log('End downloading for all addresses');
        }
    }
    // Busy Counter
    increaseBusyCounter(address) {
        if (this.busyCounter === 0) {
            this.eventSender?.sendEvent({
                type: 'StartFullDownload',
                data: address,
            });
        }
        this.busyCounter++;
    }
    decreaseBusyCounter(address) {
        this.busyCounter--;
        if (this.busyCounter === 0) {
            this.eventSender?.sendEvent({
                type: 'EndFullDownload',
                data: address,
            });
        }
    }
    // Download All for Address (recursive)
    async downloadAllForAddress(address, offset, useNode, callback) {
        this.increaseBusyCounter(address);
        console.log(this.busyCounter);
        try {
            const result = await this.downloadTransactions(address, offset, this.downloadFullSize + 10, useNode);
            console.log(`Processing full download(offset = ${offset}, size = ${this.downloadFullSize}) for: ${address}`);
            //const t = this.processItems(result.transactions);
            //console.log('permit amount ' + t);
            if (!result.transactions ||
                result.transactions.length === 0 ||
                offset > 100000) {
                await this.downloadStatusIndexedDbService?.setDownloadStatus(address, 'true');
                console.log(this.busyCounter);
                return;
            }
            await this.dataService.addData(address, result.transactions);
            if (callback) {
                await callback?.();
            }
            //await this.dataService.compressInputs();
            if (this.dataService.getMaxDownloadDateDifference() >
                new Date().getTime() -
                    new Date(result.transactions[result.transactions.length - 1].timestamp).getTime()) {
                await this.downloadAllForAddress(address, offset + this.downloadFullSize, useNode);
            }
            else {
                await this.downloadStatusIndexedDbService?.setDownloadStatus(address, 'true');
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            this.decreaseBusyCounter(address);
            console.log(this.busyCounter);
        }
    }
    async downloadForAddress(address, useNode, callback) {
        this.increaseBusyCounter(address);
        console.log(this.busyCounter);
        try {
            const result = await this.downloadTransactions(address, 0, this.downloadInitialSize, useNode);
            console.log(`Processing initial download(size = ${this.downloadInitialSize}) for: ${address}`);
            const itemsz = result.transactions.length;
            let existingData = null;
            if (itemsz > this.downloadInitialSize / 4) {
                for (let i = Math.floor(itemsz / 4); i < itemsz - Math.floor(itemsz / 4); i++) {
                    const item = result.transactions[i];
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
            const downloadStatus = (await this.downloadStatusIndexedDbService?.getDownloadStatus(address))?.status || 'false';
            if (existingData && downloadStatus === 'true') {
                console.log(`Found existing boxId in db for ${address}, no need to download more.`);
            }
            else if (itemsz >= this.downloadInitialSize) {
                await this.downloadStatusIndexedDbService?.setDownloadStatus(address, 'false');
                console.log(`Downloading all tx's for : ${address}`);
                await this.downloadAllForAddress(address, 0, useNode, callback);
                return this.dataService.getData();
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            this.decreaseBusyCounter(address);
            this.dataService.purgeData();
            console.log(this.busyCounter);
        }
        return null;
    }
}
if (typeof window !== 'undefined') {
    window.DownloadService = DownloadService;
}
globalThis.CreateActivePermitsDownloadService = (maxDownloadDateDifference, eventSender) => {
    var storageService = new MemoryStorageService();
    const activepermitsDataService = new ActivePermitsDataService(storageService, maxDownloadDateDifference);
    return new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, activepermitsDataService, eventSender, null);
};
globalThis.CreateWatcherDownloadService = (maxDownloadDateDifference, eventSender) => {
    var storageService = new MemoryStorageService();
    const activepermitsDataService = new ActivePermitsDataService(storageService, maxDownloadDateDifference);
    const watcherDataService = new WatcherDataService(activepermitsDataService);
    return new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, watcherDataService, eventSender, null);
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RewardDataService extends DataService {
    db;
    chartService;
    eventSender;
    getData() {
        return this.storageService.getData(rs_InputsStoreName);
    }
    async getExistingData(transaction, address) {
        for (const input of transaction.inputs) {
            if (input.boxId && getChainType(input.address)) {
                const data = await this.getDataByBoxId(input.boxId, address);
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
        const inputsPromise = this.storageService.getData(rs_InputsStoreName);
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
    async addData(address, transactions) {
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
        await this.storageService.addData(rs_InputsStoreName, tempData);
        const inputs = await this.getSortedInputs();
        this.eventSender?.sendEvent({
            type: 'InputsChanged',
            data: inputs,
        });
        this.eventSender?.sendEvent({
            type: 'AddressChartChanged',
            data: await this.chartService.getAddressCharts(inputs),
        });
    }
    // Get Data by BoxId from IndexedDB
    async getDataByBoxId(boxId, addressId) {
        return await this.storageService.getDataById(rs_InputsStoreName, [
            boxId,
            addressId,
        ]);
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ChainPerformanceDataService extends DataService {
    db;
    eventSender;
    getData() {
        return this.storageService.getData(rs_PerfTxStoreName);
    }
    async getExistingData(transaction) {
        return await this.storageService.getDataById(rs_PerfTxStoreName, transaction.id);
    }
    async addData(_address, transactions) {
        const tempData = [];
        transactions.forEach((item) => {
            const chainTokensCount = {};
            const eRSNTotal = item.outputs.reduce((total, output) => {
                output.assets.forEach((asset) => {
                    if (asset.tokenId != null && asset.tokenId in rwtTokenIds) {
                        if (!chainTokensCount[asset.tokenId]) {
                            chainTokensCount[asset.tokenId] = 1;
                        }
                        else {
                            chainTokensCount[asset.tokenId]++;
                        }
                    }
                });
                const assets = output.assets.filter((a) => a.tokenId === rs_eRSNTokenId &&
                    Object.values(rewardAddresses).includes(output.address));
                return (total +
                    assets.reduce((acc, asset) => acc + asset.amount / Math.pow(10, rs_RSNDecimals), 0));
            }, 0);
            const maxKey = Object.entries(chainTokensCount).reduce((max, [key, value]) => (value > chainTokensCount[max] ? key : max), Object.keys(chainTokensCount)[0]);
            const chainType = Object.entries(rwtTokenIds).find(([key]) => key === maxKey)?.[1];
            console.log("amount of eRSN in transaction: " + eRSNTotal + " item id: " + item.id + " chain type: " + chainType);
            const dbPerfTx = {
                id: item.id,
                timestamp: item.timestamp,
                amount: eRSNTotal,
                chainType: chainType,
            };
            tempData.push(dbPerfTx);
        });
        await this.storageService.addData(rs_PerfTxStoreName, tempData);
        const perfTxs = await this.getPerfTxs();
        this.eventSender?.sendEvent({
            type: 'PerfChartChanged',
            data: perfTxs,
        });
    }
    async getPerfTxs() {
        const perfTxsPromise = this.storageService.getData(rs_PerfTxStoreName);
        console.log('Retrieving PerfTxs');
        try {
            let perfTxs = await perfTxsPromise;
            perfTxs = perfTxs.filter((p) => this.getMaxDownloadDateDifference() >
                new Date().getTime() - new Date(p.timestamp).getTime());
            const result = perfTxs.reduce((acc, tx) => {
                if (tx.chainType !== undefined && tx.chainType !== null) {
                    const chainKey = tx.chainType;
                    if (!acc[chainKey]) {
                        acc[chainKey] = { chart: 0 };
                    }
                    acc[chainKey].chart += tx.amount ?? 0;
                }
                return acc;
            }, {});
            return Object.fromEntries(Object.values(ChainType).map((chain) => [
                chain,
                result[chain] || { chart: 0 },
            ]));
        }
        catch (error) {
            console.error(error);
            return {};
        }
    }
    constructor(db, eventSender) {
        super(db);
        this.db = db;
        this.eventSender = eventSender;
    }
    getMaxDownloadDateDifference() {
        return 604800000;
    }
    getDataType() {
        return 'performance_chart';
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DownloadStatusIndexedDbService {
    dataService;
    db;
    //private static addressDownloadDateMap = new Map<string, Date>();
    constructor(dataService, db) {
        this.dataService = dataService;
        this.db = db;
    }
    // Get Download Status for Address from IndexedDB
    async getDownloadStatus(address) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([rs_DownloadStatusStoreName], 'readonly');
            const objectStore = transaction.objectStore(rs_DownloadStatusStoreName);
            const request = objectStore.get(address + '_' + this.dataService.getDataType());
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }
    // Set Download Status for Address in IndexedDB
    async setDownloadStatus(address, status) {
        let dbStatus = await this.getDownloadStatus(address);
        if (!dbStatus) {
            dbStatus = {
                address: address + '_' + this.dataService.getDataType(),
                Address: address,
                status: status,
                lastDownloadDate: undefined,
            };
        }
        else {
            dbStatus.status = status;
            dbStatus.address = address + '_' + this.dataService.getDataType();
            dbStatus.Address = address;
        }
        await this.saveDownloadStatus(dbStatus);
    }
    async saveDownloadStatus(downloadStatus) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([rs_DownloadStatusStoreName], 'readwrite');
            const objectStore = transaction.objectStore(rs_DownloadStatusStoreName);
            const request = objectStore.put(downloadStatus);
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }
}
if (typeof self !== 'undefined') {
    self.addEventListener('message', async (event) => {
        const data = event.data;
        console.log(`Rosen service worker received event of type ${data.type}`);
    });
}
/* eslint-disable @typescript-eslint/no-explicit-any */
// chainService.ts
// Define the ChainType enum if it's not already available
var ChainType;
(function (ChainType) {
    ChainType["Ergo"] = "Ergo";
    ChainType["Cardano"] = "Cardano";
    ChainType["Bitcoin"] = "Bitcoin";
    ChainType["Ethereum"] = "Ethereum";
    ChainType["Binance"] = "Binance";
    ChainType["Doge"] = "Doge";
    ChainType["Runes"] = "Runes";
    ChainType["Nervos"] = "Nervos";
    ChainType["Handshake"] = "Handshake";
    ChainType["Firo"] = "Firo";
    ChainType["Base"] = "Base";
    ChainType["Monero"] = "Monero";
})(ChainType || (ChainType = {}));
function getChainTypes() {
    return Object.values(ChainType);
}
function getActiveChainTypes() {
    const active = new Set();
    const addIfPresent = (map) => {
        for (const [k, v] of Object.entries(map)) {
            if (v) {
                active.add(k);
            }
        }
    };
    addIfPresent(permitAddresses);
    addIfPresent(permitTriggerAddresses);
    addIfPresent(permitBulkAddresses);
    addIfPresent(rewardAddresses);
    for (const ct of Object.values(rwtTokenIds)) {
        if (ct)
            active.add(ct);
    }
    return Array.from(active);
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const chainTypeTokens = Object.fromEntries(Object.values(ChainType).map((chain) => chain === ChainType.Runes ? [chain, `rspv3BitcoinRunesRWT`] :
    [chain, `rspv3${chain}RWT`]));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const chainTypeWatcherIdentifier = Object.fromEntries(Object.values(ChainType).map((chain) => chain === ChainType.Runes ? [chain, `rspv3BitcoinRunesAWC`] :
    [chain, `rspv3${chain}AWC`]));
const rwtTokenIds = {
    '73c00e245574b45eca0c06796c40730260f9812fefc0da2dc64576559ac251b5': ChainType.Ergo,
    '0c60af62d0a3895eafded7587218a88157b5a0e5075f36596b3ed6d73cdefcf9': ChainType.Cardano,
    'b5148908b9a52352a78c9f8596d376217ed992625deeb6849d6f9ebded024af7': ChainType.Bitcoin,
    '7f764e980d4e754d5383b192927c321df9b116c10748903174a897ffe944aa55': ChainType.Ethereum,
    'f925f738bd68ccad506891f8a4e52437cec9ff53a20b1ab51ec07d249f313fe0': ChainType.Binance,
    '07cdd28a4fae28ea8f186fc2bbadf8698b41f8fc611d640495c186bb4d84c3f5': ChainType.Doge,
    '1ec6e90bc4b453fd51b6606b86c837b241a20efa36229e195f211fbf6f8e9c87': ChainType.Runes,
};
const permitAddresses = {
    [ChainType.Bitcoin]: 'NY4PEzZ7VfjxESbhPaCAkoFLZS4NXxXFsfiqzZTycYKaCpHm2QVDJUh9MtA9KbHZivPgGoCpBP8p6qtRQNfT8kH12bCFWjsFZaGFJbFgP6gwGA7s9eJiS2h9HdGL4FCZ1KYS9ADnqp6cFuw4MagrEXbmGyixjb1mMN3JTdLANmfFrPcv68ucpeTvGKvvDbzvLXKzQB8wVyamMYu8PCYq1QNmmHtXZSGdhX5dfajFqo8ubbJZiiTKJzQuw9d69vwUBgqmMLEXUK8MCsfUerPged4eGt1qm8ZvpPT6MxCpaKsVNRCagSVCDVjwCivjZ7owo62oWL4Q5NdWAYxVN3TG9yNy6iviEEX6ENbAjpGCqmZag2qRYmbLGZPf4XxNqKfzQ1wzriqy4M5s5mLqsKs1Bhp9XR1gjUyWvui5BAYM97XWvyRXAv5PFoZqTNJWemKuEY2wub97Ac7asNhhRpLwDMNfdW4vkpYUKXHnJiDvQQGsWEs5Jx2PjwCe9wYTRKM69t6nyfddR7quYMn8SLxVFM22xq49Cr9GHTpLZxcLCQisDmRRspxkYstmBPvuDzcbXYQtAodUKrXhwmCrk39Hir5P3XQ7BHpQP5x5dLu8Vn24jSaPyBJxq6HNBrMBGDJq9JxqQXmy1GReXp5RYi8ZUEEZFdc1R2cBw5aBNCvS2Z9UWBDBPNQW7rpx4VE2MpFNJa2y7VnSBft3cnWtbE8tsDuMpHJnDTDCP55eHJJ5iYsUEfqeHQRbXmi9AhPRaZ1YTbMFGMVu6ub14m68jrzvCpgB2wyPRnNsDi3YMhbtzYQS2uVNKpr8jDJE51bYjeLki9apBtKUhD18JCKNH5R7tWfhi7LDx878Ai2CSppY45GqTTZqNFDSFYjnhtYntQvb3ZAfEgkQXMKegz37hqAvyfNxCD94jksJjyUa8Em1JP8JrMYvEaGBcMWkRvwoUFYSa2sZrekrv9s8jn5TJsQFiWKmLmxKb1cfa9vi2Q3rRBdVEZswAxCka1p6dKjXSpAqRRrfXyEaTtHYfgNH676WnA3cxXkPeURMDf1mM15rUSLCBwtxCDrvFcsAgCdNhRvfAesuS15aUZjYHuLDXFGhSf3vmrr8MDUJQ1mqEmLWJLjwQ1SsU81GnGddHBxS8FqP5r2hFsVwboKNf8FBUQv7JWimMm8aFkgbpcG35tgpL9TB8CmpJZ53VShUVmssxMqSTPs1yxAZXG3ejkBZvV8rmdZAsnjVDv',
    [ChainType.Cardano]: 'NY4PEzZ7VfjvYJJazKf6SWPJumc29xV7MFp53j46J7A5gknMoAmcUL3bbmSTywV66FzRePafBgrpvo97LRha1rG5dTihxPPy7V6qK6bWTDyNCiHdekQAd246DxpDHdZL9LkaCdy6wFjwYppfH4g69NekX7Ur7CsQUkFwqmTQrBYcbgydzn4MaDSKyuSynwvQDCDVkiiuGBPt3SQXUZ758LURbs2RNuhTXoQ5i71HdsqGD2Ns3xekbs5hGg5byZBcsU6Nytba7AHHqEVv3NchAY63DMzLLTVmWmnDJGKDPNxKmP3bnHPNz2tMQ4XNNGdGytEnmNb1Vmfeb6mPkUveMrvJ6RY284Y64ngKADaeMsvVvbAeVzRJKB47BFyRH5Gj5eht9ghh9M1yMvyCDUEkLG147K5L9FKsDJd3F3TrhJTcNEtUPiaM8PPcF7VvQWF89dAVZeAuVoS8mojzxDU8WniTLqK4yLAk4SkULdcmS7yw4J1BbudZDnJcZiTymT8H1W3fn9e1ygyPNY14375cgXYxKhkWz7zQHLE1HHFmfaSfkp91BjuEeHzCr3g3jKJQvgtvZDKmqSUEZaBdPdiZ7ZHydHcr1KzS16Q1fv5skVd6gDBYmVepZEvZ6puwhbXyiFWGTPoUptocTujiyogRJsFEegQ4yixNtTtu4oayLVDpWrCHDdRK2qqU4kdiLcF2PxDkDp6W8yuwkRS6X8zo2RooiBB63wyS7cT8GEMYZ7HmXUjHSWHramby6ry4S3mFVAeh5oxLwhYo8HXtnfSSjYWepuh7mjsX2sJQCNGMS7gytCwXrXWdZDd4pKWn9EB4y691Bpw5VtsrYAQQj9fsqpe59SX2P9pNFqkRfgwkN5xj34wHDqDhASt7vHARW6mP3A9vgmHvT1dsJ5vBx2pciequMKnWv2mpvAhU4fCqGtNunMnvCUzZbPsgNzjhv45EUxuw4qtDGoHUxDYtBBxE1cgQhqZ5gtTUyQW59RxzU99HzQxC6PTA6fftooU2oejAjY2vLuyqkLQYtUoate3VqfW2XTx6YV8HXftr6AApL6aHKMJDdM6j54k4A6rL5jqzn9fPCRmbCuPyQhdFrbpKW4LTj1HdqEWmfQJJ8BmgUXQqNCea61A2mbAVoUSW4Cdw1hfTkmzmbezLiNtRaCkuvaSogiv3G87A8LHFWFPrzSarjfBkeR9B9CLNMEC2aXPqwWWNqDt31dctnbkgnnRw1mDGvtRtBt',
    [ChainType.Ergo]: 'NY4PEzZ7VfjxH2v4bXAdi6zEpHCTHia98VJ9niT31przEVppCK5aWeMJH71xSUHC6pN4psW6B2SDRydniQiEGZ7uAocVG4ERSoDxYyv4arAtDM9LdN9x6qzoFJn4YVtyPEUDCAzDefpVBTHvf5EWqJcikghaPc597yXuGcSemCTNrin3LXVhBBUPaf3QiE7NG5NYyDmPt8tgpAweKESv3YcsEQRxf3LEjPF38XFgg6nAmXFftGxDeSCPHQvLJosrv9LaWNK5yNsg3s2fvqE439KZpKJ1iUGrAd56TUkBVdUKykq1rJA27n87SrGrK1Y6aTdFRW3MUUHK82iK74qWeHwL126UQaoStf4UbKagskfs3mLBEekJ2tnw3hUQB1WamEKcTz36EYhFRjBuQaVUn4eRUmub3UXGb2edHZ33T6x8sSRuW1rLbxCwYvo9cyMTjueaD85f8yUMbzydzA1XkVa1YURS1SutBxfjY7Ejaw6jfbJYcQB15syRXtFR1pbAKHfMwQZ5WvcPZgjvTDFt6VKTcUh68CvtbxRcKKzY3sy9CdUgJUGyFUx2djkBkYJrSrNB6ngtN93GG39B3AY4wPV4QoTkv3JzP1KbbjxvivjLRrr6J1Tzs1y3ntFpkeScNrCzBL1bn2KMFigRNyTLLov3pkKGuh4b5HxitX9D1P2Kns5BLBu1EYB1WgHt8rmWGGEMHXQLgmEi5gtRuJptS2JX9QTKdVvcWyumpZKFkwPy5zdaUZuHozyG99KYLeQbtMpmURNwgedDfpTuiVaaTdEJkWYPGw3eyNXd8JubPWBHibXGwf3zJGzvimPkRPh8mPPgaV6zcmS9yJTTkVzGeJsepk5YC6FFDtz5okPA9KeChRqh168nycQYnNWtmvtNYXUdQYZ9XhzzN4f1yZtuSRiK4gmYcYYmMoR6UA1EDi1g7GKn1nW9gdcVsig3QMJsUzZ62XUf8MfjQ8xsMidHC4fWgeiP5wgMXdr6mYkyTSFtWk6fW6qiG9NFNeDHpuVdtfoZr5oJv5cLqB7MCJBxHiB4HAsBB39nvByqUGcagP5nZo2qoXzKeaYW8xAvs7AMNYfZ8WMHpjE1qDiadQ8jEwaYJXAwCj4z7p4dZfV1qYLpkr3BG15D7uVS5E73q7vfbd7hEthQ6U3Fi9XttkttU15nszWRNvt6Z4yyA8gY6FKN1YGN9EVzx78MD6dLv4VQCQTwh9sVg59KhJnG8xGkCv4WfrZsPB',
    [ChainType.Ethereum]: 'NY4PEzZ7VfjuayVeuhbiU3bk4ZeLo6fUpVg9EKfaPT2TRLQgYXuYhfsdvKWy2bBDELkKAvC22Qi4irSQRxyTucAxRBqpYQWRSkP2Qgeh329ei6BQ3KYqQW3RWMyQarBtcEwAKdrGNJg6nZ7CdKXPDXdrdAKZRbgauancxD3wuNbayUa77HfEy6p7mDim2XgEUNyMKZLRXpBuMB4jK9zNwcuTL5m8hCQ4dPQRxTV7piv7odT8W4oQL3KqaPd81vZzBvPVvYb5Wr9cJFirpB7N9RnWuz6Td4ZRSzTRTY7Y1PsA2APjY3ug9Mb9NSRgs3wFJhnaURzrKcbhUmsYnFVJHcMdybry5qbQSF2hXb2jhWnmxN3pfLS5NaHmg6scr7fsUiseuHpAuynpcohhTRcmwrGWfbLY9ZWqoCPrjtPZZG6CFqsVPPkFoc1jDM6muaXPxRtGftFWPgBfbqbGq5j6M7PpusMTsQYMsnnmq2U2rfmaGkp1WRyz9UgpK6PQFxiYtqdMC6vf7uetotn83drJSCgH213Z3WMj3oncVkLw9pJNnn5Qaiukdc2p7ZD2SFAUqARmNvk3v1ZuTF1Ri7rBUuFoua1eProbV8TqmSFpuKvzqHnqf4TCB4sx22wDVghWDDCbbDDkK3TqT5N2D3oDRG6qMd7mX3fNqP2mDFFHotEPrL9dyRBHoHw2n33sEi141zLVqpE9eZszzqSdkp8pmJme8yp6MCQKgUurDfU5QoTjnoQvGVDa4TwpHBijJq5MmDQ4vZLdRr6hE5VG97M7eHQe5qz8LfhPL3RGqESfNH5fTr5EGe45B1urDHMtJxD4pr3Dv2mBgeX1tLTyogZH1pJqK5Xzkz1zcwN6LFdSC33tKftBpHRExwA4ZWtuVKovJC2Q3YjuY9bunJZvD68vJxdSXdTTzNUe9eaN3Z5C7bWpbhSs3PikvmKMRW29SHzpq9R61XesYBJcYJd6eoYVwfrfWQJie6BLsvCTe3jv5gGzTQdKir6tPauXAh6Fq7GHsKK6VSu9dQ5KHTqJk3v7Yapinm3U5rkqabEQEEtLVc59U1VsjKqTB3gdFevyHMzRLhJDckdSBvzxLpuAXcjH3GEAvJvXAVrcXZBcgrDpKCRLpd78qmC8Ro3qsqP1DtC8G5Q15Qz7Ec2BchmR3UNiq8MACMhnGABhnYp17fgQ2pjbvEw2pSmMG8MZWhsLsrZhJcZs7oGLwhnuq3oVV4tPzPQTZNzsHC',
    [ChainType.Binance]: 'NY4PEzZ7VfjpAkcdJesLYFRhqaCXUuzb2yqT4kN8TGW8vxkJzGsBdHdNMQ29oD9ZM3uY7hCWMGjeeKEuFvPgXwZMJaM1m1kexSbd3BAsCiPhZmQQP3yLjzUdc1MKv9wAbwpnWEU2erd9bpbkPE6Chu4nAvfHncsUw8PmF7zVK7yUH7CmsKfTJYbTVnJM7BvvvKppmFzF9xU8CTxbJtJi3yyqxdGr4KFXrUra8ktg2BgDxuN2XAeDQeJraJKSV81DGxobNnBomSFnAM2LiqBGEHmDyD7PYQGf7ukWvzRU1qHNBEXAqQTAHfizatuVANEihzYFSqXvV9qn3ZmcrbEA9dHc1PwomGe1piavesMBWSrVGhnoaTumz91NMPdSFxX5LfGPDFeAWFcbJKt7RTLbRKnSCiFsfmjGUrtuagPaLYjEfwxsmuwAjq5pxZvVzo7BKsJsXsbcJRsozoue6acqnBGe6kje6crqTUrioopW232JkzxQdFi6VcXL2RT2hNomrRZaNxSd4MdkBmmjk8jicdVRE98vEJyCHHWHYvTpKqiHofRByAKfMzXB6S2so18NzvZu26r85ok7sMHUNbBroMT8tra8coHMFBsyoWNcEKZBjTDQGiT9o7CPmGsz7EK5L7zLc338NxZpYN3CuC9gcuGAjBsrCRCHNe7k1YVm37xN3w7SQ9esGwQUopPRwL46JfZR8kCJ3Vi8BcHoK9fhYWwQC9xEsc67YUBxy4HWgoiU2aecTFeGxhu1SMRqYCjnT7gVSk917zZsTAqeE4Wxb21J7Ci5zCiGqs7KccNeKv9Lc8nEc7MSX26bXRixJnfzdcELDdBs5FyP5rDZg5jPJybJaUTcYbDhHoDRHPET3V6eiD8AbrEfL7GXYpNb4vLM8BUzjPA2Ur7uiHG84jM4WykVdCTxyVjsBeSxzxw47H7j12pEdpLMUBU2fcf3PCJ8Gezc1ZZ1hYgwdmHXKQ5Pstdz2v3ktcvpXSCLDwGD3Qd1tm5K9QVFjmfS3dPpwhRU79gjhJiSN82HohAjzZW2WBHTeVHw9ZuPEiZVgG2C5GQnFPKeBbqMMizZyHCnvT2VPDucfNcQq7Jovp3YY7FvcToM98f5ZrKJZJdRDZA7wn4cXGCd7pnKmX2vBse6cXHC1T99Evh1gjJgynfBkaKWHQTZ9edScYwGSqFNF1VSaxdJeivn5rrvMa2DS4etmPePjLfR6Xz9wUciRK1CHHVdsAHuEAUv1Y',
    [ChainType.Doge]: 'NY4PEzZ7VfjpCVmFDDKnhwV7Dp2kKokMWPesSQsFVSgmQnq1ZW8KrCiPL1eCWv9EtSZw9tEBU4VEXZXFAWYXqHZJLt79pPspnApGdhV3pBtq4WZvYUZoeBXcYy2BjBGC2m9JHccHE9nzZC9Prz9DyMc2u2diiCzANGUF6GxmM93Y8ao888RpoDp9xtahJJK7dZjDejqY3XX3QhAFEKZmf3DYF53M2DUEx1AWXxPverSrN4udDNfKYfgNxVNByCkXqmNMsZQsefpz2qNueA2ghBTWrtkBKa4QCi2VzeoaDRwz6EYnhTnR5cCc1HgyPNHV8jjRyj9uGojLpS2ncmPxwfuXVF3oRgN1WNne3SNA6sNsvBDkGorKuTCSgwa4HGRRjeiXiDyBsdBkkKjGTbPLa2ZywSAuy43aBQ2jiopiq7sMAEWRgmq3U8NJV1jT5G1UjW7WdiJVnjVzAB9KuiPrKvQykEtkuxHwYiMHfUEyN9AJQZzkCF3V9jZoDdev5PPqL6x42gm6eFZbM3UVYwtSiC7MLGbwqyAEdzZb9SPU3ntZU41MXkmP9dD3rYd3YjQTu7wTCpGzunwxibBfSusrwSG9Q8Asjr3CFQW4j5jpyjctxZSDP5QeaHMh7sX9cCYJ2Zm1TjqUkPg1JYu155YgGaAZpFSPEkDPsu4rLBB2BWZLuPjEmfsfSr5tNW5z8zjVvvB8nDkB8CAVeGzcGFm6NqqjFFkZCJhAUgo45GpgEQGc1kR2JchpoFaVJh6seDnTyWySF4yQgyiQSxBLbTjd2daaJRMB87uqMZrwwR9CWm9VUpUhnoEK9EMkncPGRSvPuuDxtxPqUid1gFPjNzaqU8AEtGcSYvsFePrftEyKF9UeoXxxZtNdHZTsNM6UfnuDwQBZ6HeaYpsbP342hdYWvDHkj4i53V6yUbo1yTaFB5Tv1gnAk8G492i8nySdujyXRakGyXn5GBnQwVX7fZqurC4uVyhjB4X8iXkWULNrCwsafpnj9PxE5cFKNW5GefpTxLBxgpf6KHCWhPpifocDocxCAULMrYQWm7qfSE7etXHXA9km9XwHyNpMDc3J5WY7WAhenFGcNibKt2pHkJb2hxyLc27aQ4dCcoqgLqRuykTbHPWdwh2iPPKahDja8Nv2csxbH4dt1b4ZrXQzKo2yH49L46evDJN8SYU5VvTyukWFGEhnj8Ns3dZ87WEFcv1MmLg4UoA9GTgoFUMoAmnsNe5LzVnjmR',
    [ChainType.Runes]: 'NY4PEzZ7VfjxdvgBoWcqeDjH3JaSpYXt14EqmvspbdNzGQEitJiQqNMgS86VzasA9TF5JNEVDh3GkpncwYLJMeraf6AeQD8rgv8HFCgTsdznREyQCsHMSdKAgUhfZFVTgxExvmQ8GcoCfXJkxgChcrtiP6oLcnaVdF1GoktzaphEV1yb3wPhmgd5RZH1k1JYxnVtLaCiVh2fKp3fsNXwiLv5M3STVVT5xLRojJ1PVuo9H9coUNQF9jY3MSNHQiF3XcXpziwBjfqoER7UPYvMpCAMqx1PUk3ogacRun8Un3ksacj5egiqqAx6bqhdwSFc1pXvDAeAJoy8Jycghkk8j8WxHD7cmaD9mXGqQAPUVdSTeARzJWcNhRr2F8SfdV8dCDLfQ3o9Me8nhRyBRy6x3k87gJYPFHcxkqDs5DUXzDkzEH63Yudbyy9Cs8EiCNqkqhZfMpLeaKkLynBwxWX11fqejsdzf7zMZGufd9WPp8BLUwrzDiXehuqE622XNp22Rpkc8UN5fc4XWaCTC7hgQkf8ezA7tN5WQTtTtiH3iNCY3sZ1uyXVetZ4xyuEkB3RpE3zRrhan6Ky3H4EnLk9w9oqnqE6tVSg9iTJRV2zu6dk25pYs2KjSPj8db2ohY2wp1KykzuUzbuYE7TRmyGaJXXraV3HuSVCoh6m7z9QmZ1L6RC5C6egzTMRQE3yUp6kBE3zvnoSYAQde7Bb2WbG1TXrmb6wpsx1Rf2RDyVUFLfsaPNMbRCAji5dBXLp831zbT42cZCurEksuqsVVcWcCBcnW6vTMe7MMGPgStE59YxQ3Se789ftMhH5Cknj1TrbSEyPFH2PUg2keXHtCD4bW4XgyoMQ3vzFF3WT5rTLXrbFApZyjk5qAvP5drswUPW9oYBAMxAR8tBXUJXFDrMhzU27BjMzgJcFpefPUUUSJLFwWzNooopSw7iiACXZNSDQJTc2UUda4fyPntPC9qdqN1vgZ2gemBVWK8qwv2ocxXCmdiJUAXbdX2G6v9ayqQyctBEVd66Wjs6i5v7SzU3M4jopnXpHPSAt7oJi6baD5ez4GGBvTKQhwhn4FBDh9dkHK4ksE2nzUE56XgTrar7L1KPNrKgUF4NZo45yavR4amJTuadwpJBVV5HA6v62xpfuiFmGWWFucRgjXf4qZWjAwEfGkS68Cc4nTn3b4zBAFEwDrcG7ARhEydg47xzHdVtxb3zzhgBdDBY5s7jfSfSDiuvnPQioa2',
    [ChainType.Nervos]: null,
    [ChainType.Handshake]: null,
    [ChainType.Monero]: null,
    [ChainType.Firo]: null,
    [ChainType.Base]: null,
};
const permitTriggerAddresses = {
    [ChainType.Bitcoin]: '5ivrmzxYZZfH2wJRvogecZo1YYXm32CoKnSZdtwxbjNoogRakUFe56VrrcULZtCkvAzM2MNRMxPYSfZc2rB6tkLKLCirG14JPDMfqBoWMhyzzQLVsDukZupema1i8SvYUuoaiPL5rTyQmqgF3ftPbvM2dHY623B3KsKRTNDhkoMoRmKLzenNWqjXpkANpyc3TCkDuvBypXfbWVN55F2ZZUs8L3XkvaJKcb74GY7whJB8Zg31VgpmVW4uVEuqpcvPk5FYNiTdRakyYTUVFnAdCR6ZDjagBYMr3ks2uHMhQdjmoKmmwCocVm4SGZsA8rU8zj6zrEgpepLT5UPD9sZQWtvSi6C82fPEW9pvNXr4T3sFx2xNRv8meyNUhopUfiRzVoWfx6Q4ArqU3dnmRtN8pxkDfTZr7oGrzAFAb3DRhBUPhhfWY2USAw7LMqMAuW65pdUFcGnczQH3B6V4kALNaoGMD7ixKtkdMkrAPHkJmxKzeMEd6Y49PnHWxFkQbXwqGELjDppqmdbKceyrtjUp3JwcZ5qN7YcLg1yXhFUiWAHhnAwGkHsTHivXADhV81sDBVqM1GUB3piyt6gkJ5My3SaRRTsokrnJLoGL23GwjEfTzDsvXCoXww3MQcwUUCXehQConnMxYsK7HHGV4wf8kbctrFd2ekPkeHm5ksjagEVzKMraZJgrRSRWEHdYmUGkU6tLGZTUF4Xe4MkdzXC3sRtif4iUnZg6Tnt3DEx2i5fmPD4xasYkusc6thd77x5x7MZXMdkxuo9BWTG9iiYAaE4aLQ5yEbrYeVY85DCVFAKXTsiwUH1De3rDhRZfFfQRuDqiYomDFumxofAa9k89yLeCSRyQpAH55BXLqvppusJyDwYJKd5itao8z3Qi2Fsvt7oL77fDnbotPwp7EkFbQZdGi7aUU1SdyfhxNwx6dYcFe2zpj6Spj7zb98FR2HahXwXnqqZjuym7RjN55bqPt2FufJ7CwdgQmiBMid7E1sAVMxBZyAeNbhHEqRJCajpUyGXswJjQJ9S1u9c4rRHzdntMtr2RXDtdgrt6b69GpZgZNeAX3QG9W9kQK4SAHE2BULEmNSBZHHitrRYdx97AsDLFfLpzfsPa82ew9oBy3PacMAF2WP48yxQrAzSA2p5idB5QFbYoECBBLsCyApG37AMuPrr24JrWmZLqR5XEPYnKojYrMcciwkn3L6jRpC5c1D9KrsTGk5dGtqBji1FE9XAVxuVpdddJjBSjphPx2UWtvJnwcxB8CoRSsVDF8RoyPcVwMmSfL5arDGJxBUzVu',
    [ChainType.Cardano]: 
    //'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',
    [ChainType.Ergo]: 
    //'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',
    [ChainType.Ethereum]: '5ivrmzxYZsMEcMTZnZnsQm6jutdmSRzVW7WZoqN2c82khPoBUwF6GRVZdd6XhnNf9gbi3fsoZRM3cHmvz3sgJEJmy61cRxTKrM4q9ZfxYKBtyfNXLwD4CCeMedd6pxYDbgT6h3W5Qce2DZX51sw7aP6hu73HxJvcAirXLCYdZxi1nnGUbZYd8WNkU9zZ5ZGLVasrL49hVLNoJsP3ZYLpqzXchCL8RKv42qnLJ2kHc9BZJyv3QAYqMZTZSHQyRnYj4GAbdB3aYP71ge2HXCb6Arc6upjU4cWJPrPY4f8QcMdhXTrUtWp9u443Ekqdd3S2y2jfWLjDLsd7S9y7ASHPqx3GnCcPK4i9YnCQhdM8i5f59nA5ENgo24BTJvyQiRssDrCPpHxeTUp5ae2E5D4vyAnFfWCFfD6f5Z6DEDQvFnu1JLjjLcunp3rehGTSNgjyNNzGkjf6GF2y6enPuNcfpyNWsY2QJot4r1yZWqzeHvMgjbhnjpcManj1ikT1FFeg1oKZCCNBUbed4jYnmM1qFFmTYaovRUuEFXKFU2fhpz3EfEB79PUd5g5YMu1MTkKdUzLrEnoTxz9GKNpXCsoFvwC82hEuwXPcPFuMHdBFa4jtqSueVFgCPHHiXMz2koe6FGmCzY67q8215taocoiEC8NjGNTJ6Bzz3apbT5JP2hLVi6z11kNDQgtTA4gNRoftjZBBNVaFFj1DwURqEBzdawony7FvSpQYzgFEz5PKN7rAAr8Dsd4phbesmeASSph4aQLzB7iuibFSZXxyBm1w8GUEodaWEhh2UeTCJx2XtocU9aLYrUSgA6PgBF5NWzWwXDihESwyboSKnDb2mfHeGyjkjKSfQP2oP8Las1CeMXPdnwXUggckB44f82qjE5ENnqYhah4s5WkgPzzSvx42uhxc8VTbySPgiDefVGuFCEATX6fgAs5ikKh38TYWzLbUi9qM5Ncz9G7Z7Mc8RTdKtRLSxLUoPpiabXtyfdBkNr5PYhznMd3TPy9EHKinSzPV3GiJHGEkfYAbGmf2imbG2LrGtCEnyft3vBXYVocEnAXZsVKSRMPvkWsA7J2LRuQHrZCbVwY4LBDpfrHriEGUnAd168HB7DKPqRtCsVLgd2h6JgSHS4xXvfSwhG371VfTxJgAAtHUgKttcZfpZGXffLCwP7zmQGNVz6FJLsTEN3VXaQMQ7ooCeGHFdL7nbB7ejitfnWzWqgwqi5kv3nZEcmx4YfcnyvAjBosChtBMNfkMSVqa42Mx1xat4eJvHD5Jm1AwYijVqQjcXYh1ZzHqD',
    [ChainType.Binance]: '5ivrmzxYZw1LAT2rQQY7Gkiuo36J5uzCTyMRoqee9QDzT4Wa1NnZaQ6zVLw3yw4ksfRCdfKiCYfjyiaJuAvdwi8WfVd2VJZo5VfoX7qNEELk34ZdvjCGsSdA3AWVfqSPy8NxPqm41xeccezcgRCVmyTHJa4pu38vtBvTZsnV4jzGTZsSstTQPGZMUUTys6VSBRUGqQjFpjVty3jTFudfJ4rRgyuGhyA1A3jgzY6wPSBXHniAi3c9rQLVEGNzpuyjXD1bFVemGdEmZp5tYLKb5BMsasJr6fa3P4xdyWryg6uUrxGiPZCRT4Z9DMmSyJdfVBFtnLaL7abqN3evRuHrGMn3KVVSFocUM9dLGZpU3XzzvWkgjwxB99FVJ4TzCSKphSgh3gPuCnwQWFhpuRuJJzV8je2jtYguEMNzcygK8WkvkuTsniW3zqJdGpHEqSKcQwnR7a5nP8yVyRRi26aYrNDjuJ2XoqnpLSSNAPmFZNApWcXGRqsqdaJBLsKPkkFXNYfcpwPNcpuExuFaeLhUaCbxdjWKBWMHPxqEhvK2dcs6uXhPjp4QX9XoMSiRqBGC7YAxhZkChKaxmBM3y2sTsyfW69LFM2VKs84FF7tXCGKPomVABQCgVbt5p9BKyPcL8ERa2LJrzfKJwfoXSAPrrK2QEd5zaDi7g6tSVy5QBFzrYARnncF2ZCuGR9Nmh6VAWumXpHfVq83iVVBWHKjSvKJuBEFUzg3G1dWmtwxqRZYFgdgd5FAZp5M6Nj6x4VMi4qcJe9S1exhMHKTDmKnmsJ7AX4YA4MdRGYXGJHRSUb842gqEYbqjjTSu8xRghbuxg9ghnr8NVx4uxwE56zJUMzhP4bVftTH6XhS1MDoRUPi451LcAbRr7QLR7gq8FS4H73FtJN4cni5mURRpNAnzEYFWcjmqaUuC9VSfkuD3Aqk7vSKpbJoSkcaZMXdqb9G4x6SGxjphx8kvxQDTJkmjkxNB5bADpRA7rfkSjRX9zekM8rb7NKu5doxYovb1qPgDuPPbD2eA279btntL8xzqTW2JWQdTPqdHG1ezxBsSWqWdFzzJYFh2VWuYB59A38EB9Mcihj995Y1DGfLt9vHMaw92ERCeqtk4MqX6WSBYc9QzTEA7wUtdYGXLydyRRxbLpYTfTX4sUvhCvg2YGix1L1G4nFaNRq28jiZjfKTCLr2TWDzFvX4jVWhFjFsBVRSCQhiKfDRpsUXm9CYXuk9tvnoVj2NN3e3SLyiWjCEUap84EhdyZn1zHHQSXnsSoSynR1kiWSDCuJCBcyM2MQ8wR',
    [ChainType.Doge]: '5ivrmzxYa3qBuYZ3teFTEJP1ziojbVZAYdZF528CNfT5tiycZoiqXfZEqgud81sBrXGyGoanY95RS1xwRSzc4nSGhvhg9Awr23q8vde4k7PWrErq42DeCwborsxAwKm1YrWJEwD8KZiKmSMR9jCD3pTxfsvoq4yMJeh4bscJKRj9iuy79tzWT3NU4L1vrVNjQd9ksz8V2mUeU7EXouDTHxAM5Vci3HgeC2CBqY23J3mpXryfb3UPha7a4zf2eF7Tv5viA7ayrGgu582W2ZttnLFHQTRn3gnTU715qzjk7NMer98y528FxXNZsjSFs72tZm4kL6zMthigXX1yNBtr5vXmYKcHUyAeRWuX2CK8jAFWYF4cJeceCN5E2KjoTK47Ge7q8B9MNZBVU83HPGzjVkqjvFDQsDZyt7hyCRhguwKibwyw1Y76ceNXrhzwPgukP6PsCWyipqSMVTAxB3QNR46mGi1v2S3MNKR9bThJU98yQntABweyLuqHVmALaU5s971p9SPi25gVnLsFD2FQnczLpHR2g8iJ2PcUZageyVyCxKbX3EvUoyQTymeaQuSwNgySKAs67YgUPFGcmXD33Fbs7vQvkrDbqUVprE2igGNZvCmStypiqZA6ijDzbaTX1XwFAehFT39WyGQ9NXzCtYn35fj95NLkDWugvEmqL5to8JFbCcHbV13WCJaVgvcerLKU922nuM54QXYNoSQHYdCypp3PXwaWBbsemt1cbH9mGM5JnYuhAm2gKctu7rUwCQ9P6qx7k4nC6ycUWLPsYeaYt23RXxF9cx31A9nUqSW4n4j46j3fVTkBX47C7X2TFF2VgHFJky4d3etKp5EQodYs2caNLgmmACErMCtJ1GuamHCfSEg3iLyLaPAmtRM9HFUVCsMEL3GwLzqEasH3fy9dpUrAh8FqAHPT16gAx7ePEPU8k9obwUyYqkxMBuyaMonoy37GejLXzpzM9DTacEuNCBKw9hVHnDCB5Zxkhuj5kkaH3794qur5GCF3XKFnWNuKf35DBwVeEq3SMMsWmcBB6ZqfJJxa4vCLS6aEhtDxnSxw1TS8T9bvu91dXLH6HoAfK5vnoGHKP387yTuJmcbacFtvBoT6EWDS6DvXQx9FptRgojeF9T1ZjCChE6igPL9WhWPvvCEm6BMR2Jtsxw16JJzqMW33W5CBJstoi8oSKE2yrw7i2hxsyY6UPDWZUe4Cex2tSfWSzSS3tXo5ahVMfoVHxUmmKJoE6St16U58ETVipwqU6WLJT6BGYboueetYfbzL37FPgQEruWWNT',
    [ChainType.Runes]: '5ivrmzxYZwTAiTX9sPndhvFogPtijgcySCRKTQBJwcgHkKVsM9Chqog7YhdVDbf7AH9Z2PgYmjMrWbPgDDCHLDANY9RyY22DvgyS3P4XmuD1YptEBLveRbcQGJjeLmxF5HzmQePE9MtFC2foD2e7gWBqqSuhcSQMWtWZXrsWzEgbtvvQP1UYsW3DHaXa89oQzxiLq7bGPrVqvxEK3fHS7onA6MZo7bf2UxJE7zqnbvq91CLZCAcp33VM48vTmwq5X27URUV81iJdpqES3JSVdAdDqrMXGiqCh8rB8mJsVqfmUy66nYmK5QVSu11N23pELKWotBnoN5WxZuHugeytjkFRtFMpwuowE2tmrkJ6NXF4BBe3hAh162o6b4zVUpbkhsjg59HkaSeFAhQScYYQdcJf6uZoA8cF7JHya1QEuVzeG5esubZjDx7MSPrEL42Gehvbt6QZ6R1QYK6gZSFB7twXHWWgcX2VzjofWtbAJkN69JbaWh2W54PQ4x8JZdUTWQcUQUTbPd6T8Wj8xuuXWfGLsadY8CJ9y1Nojctupz9MxzkZZQZnqtuwnNU6w15CP5MGskSbpF4U6Ha6mSnjQzWRGTjZTS73nof3Rr3QcJzpMbT18GQCoZnkUXJ19ch5Ub62pBhSc7gUaed1vxMfyfHBpnviCMwyTA91MWCjajbMzZyEzbrGz47xFW3VuPkTqtyNTFbue8pgouvoDC7vu7haTQWyjQXQ4UmVN6cWNzxKW81JhUSUWPXy9spJcH1ESXwtgJPGPfGwdmCPkJogdrZvPZcrPpDEE3U2UWVKHwHPVgGj1iDdXDxCaht4AdHus2sJhtC2P3N4gsP2RFbkecSMZii6ZB5R3n58qzq3xnCeHbvCu22Xdkao7jFPkEjDqdsbLVkwK85dTVHcybB1xV2Cgvv4YDjaHemfAwUrWEfELi2MgJeRxrA3bPPT8PsAh1uSMMEL598EijK2Psn8YwmwZFTMoigWEAfr1PzvisDZjYAH6ofrt95jFHuT1XKFy3wT5uhveGWjqFjhJpV4XvvRf9qLBiv6XRTqimK3AQUR1URog9fkfVd6u9spDUTkX1tWMTXRTPnrCPkWmkjY9K8PdSsY9YsbTv6YQ8HzeeiHTa18uPhy99bd4k3bubL1zuAmPMoNDUKm2m9d3xmMB6soNS849xt1LS7EeXRzvkqEY2kU75QSDSrqhaMPr4iGYkd2JBjyQohbCMsWNdsjWqxQjgCc7cyTWQngrtLaFRXdLbVNKCzHvTzCnWqpa8xNZB9ecsrcbno13jrAKzHhx',
    [ChainType.Nervos]: null,
    [ChainType.Handshake]: null,
    [ChainType.Monero]: null,
    [ChainType.Firo]: null,
    [ChainType.Base]: null,
};
const permitBulkAddresses = {
    [ChainType.Bitcoin]: 'ZsPNMsGz8D8y11MAneZTVjJndCjgTUrBWezH77jKWr2KXMVRgs4gRkDdTLoUQq8xqtGoESTa7r3zr5E3SxQkE5CM2PaPDSHb5bQWeRtaL9eikJWw95bx4DSjCDcsECpjLxbEfahCHy2sDuXQg6potLhwVVADP5TNUxEDgWPR27x658qcHA54TPRhybb6z67cdmkPrQNXwumoGvoPNnqVcXsdXS71KpQViuk4wXBT156Nd7Tt9b3Dvx827QiLbjJXuajydCDFC6yp2sj5dk7uA5ArNfViybrVQaf71GNGwyh6USgVKBpTurrRBtxeGWNzXi4krd7XbseaU5Crnauk9fj5jEbVH88sPzuD6o4XReNW3odcKDkvqgUh9Vu6b2uGLJsV5wY44Kk3bf8PJmkTc6vQE7Mprkdi2jBfZrzffqoKC6hWLfSZNcUWFV821L43VkJbsaYLukMq1SBJ7y7rsnWcct1U8owQbDpboysHrxfeE84JMTterx8E8sxJqwQRRTxT7M',
    [ChainType.Cardano]: 
    //'ZsPNMsGz8D8y11MAneZTVjJndCjgTUnjAi7MBVhohaELkSWjyWJLdqw9DFRK5XJ5mS3TnP1cxLsjn38fsQ1FKDfXpczKLF38JVqUcTgTz4vWuQ3moQtya1Yb85tJXVnq2NgvDcuWJsRXQWyqBABL93WEFwT6TWiZeXVAQ7x3EhJGmFvUkbZqbtkHvbYACQ7PZVwVNXn44saome9v7QrCMqvxHHrdqaSc13dHXx2MGVut22sVvMsNXT5ody7hoAqmhfioxM6Yw238jUyturCgtbWdVr42Qv5t2aZ8YCdz6ifvqSbKmnNUBSiccfxr2G9Y4eceJ5jv7iJEaf3RAoYH9vTP1yiacpmFZLjtT38FUz5n95ubWfNg5kZAiefzyaFRpV8sRH147FoaQKFRUQRACivsVvXRBhZWYeA57VZ65E7E6d5RU4JJewNiQ5de5daAQXnC9aV2diVXw9obFC2aBYqHz3U14gHss9xvcVPuqFsJdQRLsejtnYxuoZcJF18vohmNKb',
    'ZsPNMsGz8D8y11MAneZTVjJndCjgTUpy41nyeAgcocgvkAGgguXhqATnDyetHbE5u3cexmoybu5Yn8G8QWw8JW7fvspTcxXXtodbDfPfHhp25XRwu3jCF9ddG9aTZPeK6PjNqZuRT4M8taTgVS5aEos66NTvKrjRLpmSqWz3pZM1hXwMUhkQQR1sRw6pup1rKZxo11rPipScjNs7fDPcHnqyoYb3AKoZABhh9J4XvBF8LqxN1FUkqCQyk7GwB5Hei6GFV88bjrTFEXRUnJ9Mh5kqVqPy4nGCsP5CwZxrreYjhrtPZaR4wFjUzjoQXRzFsziZF3Tt3UZkmDuQUtVZWqnuhHdLwVxG4XFRHwKjs4jYHkeJ1VMp72L7NTrG6EyEzmfk2AFtSTWwEytWPW4Cjys4hCEDozs8iF2vJa6wUwkMmrRfJsWK9Pxcsqsfp5PjFo92ZSw8Pu8yk1Xgs2TLFACEMWyG2yVVF8XJYDEtoFmTEQbAjpcC4FHBFaAaTvf6nNDk8h',
    [ChainType.Ergo]: 
    //'ZsPNMsGz8D8y11MAneZTVjJndCjgTUjPFBh5wF6ZNmMySHVDcBmMx2VxGFNCcMxCKDPkdPEzZp4bt5pgwrpZyKV6nmzCAh6SaX5ZnN2fL2X2UTuLvmuk6t8BqrxoiKHmqASttYk6xJPNabuF9ZNMYQBikFWDmq2jrxZS1MG6gQQ2Mx1MgXVvPs9ZkDTe8TykK4MuvQwtjaatjugK3FC5gsB4e4KiTcMPzreUkHvC8mZQGTtGkmHSbq8hkUDfa8MUMAka4oV3unyhgvx9MHjSDNaKWtqrWJpHCsQqPxvzPKohoYSNQt6H3V6ddw1dzGbBz8eKSbno5tEaLSryLDeMAbXhivALPZ3uCyWvx9BKFxSpuqCuQs9aXH7zKedvxzE6XRrrC2TZcWn5UinvbMNu3S4i5oTK2Y8WeVfoy5XHRbK7AL9w9pimJBp5Dx2UnhhHrWbeg9XyVZP7uCEqcUK3iVFmdG2euUa84Jbr7XVaE8v3sBa8LvYdxc6wAVfgPNNbQNxK7Y',
    'ZsPNMsGz8D8y11MAneZTVjJndCjgTUi7z4a5wHUoBWnMsQSGvGwwrADVqqRBAYgDm4QmAD5Qtf2T2NL4qbbCv25HSE7PdMR5AsFH4t7Zq5yF23X8ne4WjFsfYwzhtMG1EHhbJCzSmLMV9R5L3jU8p4aNY6uBDn7efCBnPcWEDfZF1vPwYit1rV1SapMW6fMg4v5MyJUNprD7YLwuyUaPx4Gp8wnpkghuXGwZhGasCNQodF7LDMWbTBECrrtYNtDNiddhFioxZdPCg9K5zyHm25zqoA4Keen8JuVtKe6dVHjn5RuvqeDgpUBNLqPQEb19yn9byLrFUEw1oMBF7CwoRRvkiobo4A3WqHrjv14dwcSeRidGJotxxj9EZzvgGMytPeYTsrWYXdTkP9NdjmkcSYw3cQ9PRaVaNYdBxito4DDfVzUVJxVf7JFXqrt3JJGre1WsGtZ3FrLQwTmfVcA2nSpdHLeNiLHuUhnoqMQKQEfiP6iiofVqiuVajyFdeysKpq1SNE',
    [ChainType.Ethereum]: 'ZsPNMsGz8D8y11MAneZTVjJndCjgTUoSPbApCbagsfJ9WvbzbsgAbzHGNF5aNaoR2AyxnrCBH68d5TDEc8aBhVRBT4Q5UC5tdqi9JpMqC8CYFja9PYqMj7KZDjPyMHPxbqUSrq8pGVwe7f8dCV5brNYBCrNqcrC5TmYvp2HpoEUXVb7JsxCuPWQFJgXqYhzEbySQyZQGCdVX6XtjU7aQZK5bzijsXDJhuntTM7ntmdSBJjEhtkMrvrBH8RtTW2JHZw5ZW5QamM3MJbfYDExepJQeJtACiz5n36piDgebfWgjAgibjz6oXsky3mJk2rAETx25AMQSAkHz3cYnH5Gs6BorBka9qXK3U47Dk4tobZGbEZqVeFvuaoRb7VcGUvX8L4rQf72gXzVVCVvY9YEzVoFEfFGe392S5e7X6QpdBuap8maYY4RygToFx6fLeUggDP1gEQ2ptDXZoCcthQPR6ey1GtEju8jqujt2VvJ6A8VjCbU3JYvozB6kqGxLCLKHaN1zm1',
    [ChainType.Binance]: 'ZsPNMsGz8D8y11MAneZTVjJndCjgTUmenzfjjRBRRAo2DZVkwmBZxuHGoNTFLLrmFhsvuagJbFxBVLFW2nnoSuDHhNckxkJhBKNVhfPghWoKTuCHsEdJcJ1RD6XTT2aWbGPwHkja29mj2RibYNyCqjkPWEmbRJhVvfN2DUZ9pExxBPTmghNa6tFQyLkkfHdmuXEXLdpmWndfdknawDuojQPGjx3p42ewB4eeV8Zs7dDCDLdUUghTcczqJAadPMroUpmifMTw1FrpU3jC3kMaSzYpcpPu4e44xEni3E9hrenfQePbFVe9Jq9bVyjsQBF8vC8UxqefzEFmMoHT9xkdRNsFmfLMAximM3nyNhTMgLimWvLcNddW11jK1FFPumgKRUUeRivjtnXiRsNedXpmHKhvSVvpS8wAJbuySw3bHqkrpgQHqAr6vUiXj5McjsYzVh7PZxrUgEGNe8uLk4UpxJGhW3TVLNcPHdEbq2AoyabVkK2ChbE9KZ2JJBdHah93VgZSVG',
    [ChainType.Doge]: 'ZsPNMsGz8D8y11MAneZTVjJndCjgTUn38JxZpW4EiZgEoHt1Juw2od5nVwwx23kjav2ZzWjZAYrjAQnGwskZjCxmVagr3o3d8AfdQZySQigfqzTFjekNSHeQBuQPQ1y3ry6fN4w5ECxn9jrmho9pZFkBddZ2QLbAhvZVt8WrpduXniFkG27KsYo6ikCtgRsJyvzjE7kubBpsYfRf7tV8ZT2RyZaSGJp8Lo6SbrAMdDA1mke93sDDkP6B1cXi1UdSSg8nAi68b2HLJEdnw52KES4Xnh3Dg3s3n9Ur1mGf6WJ44oVVxwsBHoXWLhoAXJ6v6XSnX1rxBcqT344WHLrezqdGwzYAbKYqGtUiEZq6fcHVhL3Wu3pxkv2WbupVFpVAeFPxYzcwwf7vtibL7KG5RDuZ3rziqCgLC5jL9ckTS4KkZXH6YEJktNnUmULpcBdpGUHWzeea2SLMeiNYw1aoZ1k9QfmVK7TjxKJ5g8gSrSTwmfZHMPD5v6EBYyu4gBe31WXWVz',
    [ChainType.Runes]: 'ZsPNMsGz8D8y11MAneZTVjJndCjgTUm8aRdfPdTL96n8TUczBDtarP8o5pFfx1VTt8SLmb8khLsa8Jg34fMWSUnTroano5tp9vHvj3M1sPbbr3gw3jZGae5LUk1gAj1G7ytudoGXtvoDjNtrpfhwQBVat6xHLuyE8vHQ7CaaToTn5MTFdeYg5u8P5XSMHtb37j4ZjfVu7H5SrMDMaGkNUqRiwvU4ABYUQEc6qNqE3XqhVY32EerjQwB4vGQwPyy71CerANA8TVcj2sqERsXdVwvR2zdWoL9cv3vc1MwVnMMpeAw6Tuh9NcwmYHPcgrxPvZGwn7Xcd8BMFfSDwDGxKjEctFfH816Ba5sZKV32wwLHbACLniA5MhojHNzjAWuPjHCGeR3VF4iqW54kDwuk3vqbHqM28j9JeSwGjYaYYz87tnfhFchAAgYqmoCFZQvAUJo8SZThNTmTrDZvWeS5BPSYNQiLTMgqAnFpVmsMN8EqEnQ1ggHdLqWQT8bmMWd3UTTwqs',
    [ChainType.Nervos]: null,
    [ChainType.Handshake]: null,
    [ChainType.Monero]: null,
    [ChainType.Firo]: null,
    [ChainType.Base]: null,
};
const rewardAddresses = {
    [ChainType.Bitcoin]: '2Eit2LFRqu2Mo33z3pYTJRHNCPZXtS2f68LNW668eK4nJNwXQZMTEW23dCLCxfBX9CZfhHCCt1AbFaprUWX4wG2LfPVrXjGSpZCB5oX3FQ23WXi1YB7LpWt5UCEbbauhPcpkVV7wr5EZAqcVqWR1ps3Tnt5nMH1a3cUCMugh1BJKcBr687wqjEscF3kYGkKAzHnVaB3bx9reqJf2fqtC9c77EsoxSpueQxVhHoPaYwVWfXcnaRQTTR81p5fQJ1bSLAsRcfoQjF8sM4dfMeDrDGwCMor8vQFzzTmdYRc51jtcaRevAQ2JiMNp8DUbJEevVPvtWhYGPiHA7EdFKsoUQHGhm6sa4v15XVUiZstbJ7sVDmPEX22peSTc4SQBPSBEUD3fRExknLTChW4nVjLZcUBgJQSDoDpakHR2v8EeSnpfrnwmnY4EoGAFyL17nVJBUjgjGDcbuV5tFPK752f3yJqGr7H5KvejJot2QjAmzdz9emhmEHoqVuho2wiJ5nF2S8PcCFwrsp38cgtvGfFvC6iHmKtp93MTEq66Bw5kKooD1vZDxTXHRnZNi3Y2Rz5VKBhMFi4BvRWu2k3MgDVebaxBVXfzPdVqjHr9xitdz6cP1Xrdu7dzuLLjfJNEh8RDGtGsdcizfeNZ3LCZVYb1fRyTKY7YNu7NB6wDKKPoCEszpxK1FhA2TDQ7HXQTxAr62h1Toe',
    [ChainType.Cardano]: 
    //'2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUskGdVdyYY5RBJnp3dfYC7iPoRNeopAFQWFwEbTieow347UhRyqvo2LntFpXzomvGwVTfq9YXS8Z1GGW5mUEioD5xC17Sz72NLbQrskSx7QZAxQTbMGh6vwM9J4q7NzRmQeHmWaHLpUHMU4Jdd5ccKumMvAY8d5C8RxB4iATySLY2N1wY84qNsWNaqkNofbUebf6LgmU9HTKAmU3nDoBfX7mhCjH8kXDhZeYdRsuLVFEYu83TkpwgHAYGmUoemxWAeA2BKMx8CBAy9jxbCyUjdnk9i7sLxuejrwLLh8W4tP81YkESjZ8BV65BhzPdvCaiX8vBSorgFfnvGKVzwfhhsSDwLY1GUwLTMLwTUTjSzEjsMX9hzsEEEmhxLsekabLmK3HZ1jssLrFryNuE59uS51hazJsi3gsT8SBk1J9YV6Dq6xto28nLqrMqK6raqLcAm2iU8hBtqdoSXqWzsrZHpqc2uLGhY52ee4k9TpFBvN1RovYUtY6KS4FncT4UgnbEFkzsnWYKX3CDn16tJs5CyZ97gKcvUonZ5EqTwabzni14CcQsTtKtEAqj1odvSyfJ94NnEjuiVPC3VmZbQvveN3bQ',
    '2Eit2LFRqu2Mo33z3pYTJRHNCPZXtS2f68LNW668eK4nJNwXQZMTEW23dCLCxfBX9CZfhHCCt1AbFaprUWX4wG2LfPVrXjGSpZCB5oX3FQ23WXmpZzKdqWpu7XCLS8uChz5mh5WapTWR6ypbtLaRBmEnLp76yVy1bFz99jMJozPzYZs1zhrAPiUBP9b3HbskLoVSfDGWiCwQf9gt1sxvn1pstdxPjRB86Rre8BKmvDbKNd1zhSDBRVTmVn4DfgugYJdFm4W2V1SQtksvM1KXMWsziZU3M6Dy2N3Cb5mJ6v8cyTzR6w5KJR6x6gAtwiZpK1WxRvG9FW7jrZBZyP4MDy2BYL6RTKedxoxFaGAMmWWSJVJyUczGzL7uinAWXVB2yG3sbkpKYK6iwZkydwK4C67dc1HQQqXJyYChvPhpJYQqa6Q9U2EMVtKq3ALYvcBieRF6oQJoXFDruZXQk3hoMv4vVxufkorVTovwcEa2zgbBJy6pETfbGmy2MtRvShhsHjNH5RmfMUoxiajEKhnoicLBR8THDkZczB6PJ58K4VPNbNBJjxWXwVn3NieDZLei9RyqdYArEQWzcsupLgdByLPfwepVEF8RRjGZE3hQkwuBbHVMVZP1eWDqtMjC6bXQVQ3BTRWFdwnskzNXnxZRF7nFFt2NSSbawxZnEvFkYNQ3jA3DsMw4bUgApLXuaSuf9d2kht',
    [ChainType.Ergo]: 
    //'2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUmvtxr3QSv1aLwThLXxeqYCCc34xjxZDPqPyNGYvWLNeBZxATvBeDuQ6pSiiRFknqmvYVsm9eH4Et3eRHCyxDJEoqZsAahwfVSya34dZNHmjaPQkwWo3Coc17pxiEnWuWmG38wSJz1awE6cymzhojnjxDTbbXgjR1yfYU3AU2v9zttnT8Gz3gUzZNSwjiXSPu3G9zkDaFZVKqb5QwTWY3Pp6SFJgBQfx3C3sp4a9d3n9c98pfWFWAGQN5EfkoHosF8BQTDuzXG3NU8gVCNeNPXYA8iWCbvY3XpxQMvQUxqkjDv9VQfUNvAKVHLW43chi2rdBrQ7Teu6NnesLRWUKXpzSxpByWftkCCdBppjZtYmhhCHqpQGkQyTcMRoP2krFKe7xKbfnFkdkhaYH9TTdKuTuKtGb265RXxiqrc34KvkZpaBBQB5UvoCU4iLSDngNTjqkNPnWekDahzNHLd6CtcdC1B19jdGEXWeNADemDtdK4zrMNg7U8iVpyGYhLDnkeLVrcbhoxkHxrFwfrN19XvitDosQqmt9dseR6SWHBCDZJdmJecCiEwd2wBiwN5N5umEy3Dd4Hznv7kDr6eX7KtYxp',
    '2Eit2LFRqu2Mo33z3pYTJRHNCPZXtS2f68LNW668eK4nJNwXQZMTEW23dCLCxfBX9CZfhHCCt1AbFaprUWX4wG2LfPVrXjGSpZCB5oX3FQ23WXmNRtzqk34CHFBRzcqwHKfq6Nb6DNBzECArvDoeD65ViwRDvv2BuD7TLL499JwhxtWTmdAcEdC76bJVLzpCcpy8YBSXmXG8zm2b94BKaWRGzXuY8x2MQveE9cD7goUvU3iVqKxcM2boXfm9odgBQTjMnsVVPXzE2C6xvXsWUMoByh3pvwyCXJBSvKQeHAiJGuhB56FVum7Xxf3J5CBmXJWgU3GuJszvHXmDEGgXjEyWWyP6VCiQtokZrfWYzFUPtGQNzqMwmrAQC1A8yXxnJXuQG41BG2EFpgktZDyrRwXtPaCNDbrMSZ3JDH3K55UuiK5jPTszeHCGyj9efwVKtt3defLLW6r5npqW5QyoHZ7qAAjoy3mpLDe5tujTsKWJywtRsWwXRgxMWhCV31Gmv8bqZUhKb3Uy1PycskevybXTnb9K9FmLkHbDGt6EvZeHWDcar7hjs35hj1rzMHMeKnRvS5ScjSEwyh1kxhfXxqBG1gVWAzgyb2feU37YBg7s3tESnrTEUVtKpo3TNXR3STbtmbGgJK3Gks2ibcqGYpWQFsjPmUdwb828Sd9E2eGa4npGCgqtE79eacf9mD2bG39ZMK',
    [ChainType.Ethereum]: '2Eit2LFRqu2Mo33z3pYTJRHNCPZXtS2f68LNW668eK4nJNwXQZMTEW23dCLCxfBX9CZfhHCCt1AbFaprUWX4wG2LfPVrXjGSpZCB5oX3FQ23WXpZ4xbod4Vy7RQEtq3H6oGHPpqcS7RNCHg8A33hzyFbkZotLMKe5KgjqxkFNP6E2vuHNbJfyejHqWRbGcFSVQMGms5yurVSGj9vFBeYm8a4bQnRVSXghy8zWWiNMF8CzeytosvWqKnpAyX2sMkzC4Q1XDy18EYBhoW79MrxN1XgkXTNDLmnBPXNJHzqQBSPMFTP4mpYkhRtTk8ysED32kYuXeSxR7uW5ozVomnagQz67eLpWL1njb6kZj1CK2qhyzUYGKhC22y31WtdwFfgYRAFWpXVj9LK9ytfotM6qiFqLMTCvxnd1kXfxrHaDxnA3Zb9JpuvEz1tXPCqG7dmPGiufTPrZVaUB8QqNq7tB3czkHp2tBnz28Kbshu2WyPQRerNXTq4wo2SScm7vxHn8MMxMCLfLQVgM2jgsBVM9kTah1CRdfRMnpwFjR8DQBHy5RXnZuq8F2h5rdj5cUvyqqSePm87wJkRVUbUDD7QUWC6eaxoLBxu8TMqWrGcNhK99L3vALCmYY2vmMtpP5wAP8QPg1b4bjvKovgwqnhhbBeRA3cQNsTqb39gpFFixFPvgBHBLRHboFSdkijmC9nR5eFZZF',
    [ChainType.Binance]: '2Eit2LFRqu2Mo33z3pYTJRHNCPZXtS2f68LNW668eK4nJNwXQZMTEW23dCLCxfBX9CZfhHCCt1AbFaprUWX4wG2LfPVrXjGSpZCB5oX3FQ23WXngzCzVMczm55p3JwVzFVnpaNLHr5YzfE6S58KhEC7si6636N7jWLkS41hJ4nCDm3vHgPNt6shGraifS934CPnkKc1g7DPkPpnDbaTQBcsguRtK2sfM1YMd3zFLXyWoHt2cDJ62cGS2Rs8buoqKBcVtNJAy7XoJefoaqmhnR7HAgpbzaD6enE2mxR4aPgYht9oKKsXFgBjhFwwemwFsjZpWdwN9QfuABr2EcgMQCMbtEjiajQw5wXGxa2R4J95nBfV8DM7AdiNS4zTwFrLXMm8FTiJUFGEJNTGrUp6VXvokYQaQXtYKQKGktfgYQgpysvaGcFhMv39BnzQd8ppYd43idTySN3jJcedfVVfK6VTEvQ5WfVYVKMTphe1uRQkes7ieKKVXgJBPDYgD849VsUTHwErwefVCSCmCPdQ33yiBunwqXy5guJsGo8KSeGaxkSh1MAQ689XoF98iDVn7tQuNckoQ9v8BJ4Lv83tkx1Wdq9s1X3345xRRRJ5irGZJ5GmcGaHRHjrZ1GDv4dEtaJK6XFQUrgPTwaMAJUTt8yH1SAP1HMpwxCEFeMjo5gTEmRCt7L8Mhh4xEfqejJ9pCaLZfE',
    [ChainType.Doge]: '2Eit2LFRqu2Mo33z3pYTJRHNCPZXtS2f68LNW668eK4nJNwXQZMTEW23dCLCxfBX9CZfhHCCt1AbFaprUWX4wG2LfPVrXjGSpZCB5oX3FQ23WXm3G6GqRLTN8nv6Bs6zftaDYS37KWkH5wwbCCUCK5H3PDDakTGkPTqTZt4ZVYYiYzUWtWoGESu7vxZmXphk9AVLcRi9xY5iF1TYTS11u6nQwiLiV5BEkKKxuUhbe1LKaraFDxV52fZMQ6xpgMfLDXby28XKUvZtY5AGYRNoehhjGQFyFMRtC8DKtndxQydNHMzF3KU58sxgbKtrb5cJD21ML1ipWHkYC8XFhSkdrvGUSJ2Ycfr3p8hrHV8AwHkWpGCAPNqv6YxPmCGjyhfvUh81Dc97GiqZB8q6iEsRjmhpLmwcrGfJSuZCZkrYHyPG3hiiQjy1wkt1pAuDb9SPPoznSSEgb7BgsswwAYnTdn16UJ3RwdnDkvH753MduzjY3HGZFaMwN55gdMEaW3pHAeeamnmCe2giRiG7LNoCTDUa17AD9dhYWvN8dio8ZxUKgtcsizX7ixG8NV4QHZsbTkKVmDB2KkcFqN25SubPmCzdNax1XJrNhGtAjm5n1qzytWA3AMX61VN1Cu6TkaZNgLVp3TBGDLhbG8ARPwzsMgvjZg4iDoRuQYUxPnf2RSgQQy4ft6sAgc7aymcF4zJfT4ARhM',
    [ChainType.Runes]: '2Eit2LFRqu2Mo33z3pYTJRHNCPZXtS2f68LNW668eK4nJNwXQZMTEW23dCLCxfBX9CZfhHCCt1AbFaprUWX4wG2LfPVrXjGSpZCB5oX3FQ23WXhvKvzeU527BLNfBjVKY6x5DebdUbh3AxRX4bPNNPibyTwnZsKiqchpQRmouCfgeX4eEQ8hutH4QmkUf7sHNT8ytGvbUsAhXtEiFQsYQkVrJbHJbJjrWprVpspnVrLtBveAJUMjN7nVeJW2s6WmCGX2BY6Qp94m3NhdimvmGWEdP36ka54DPGoVAaqpBzbrfxy2FWEEcYHLxRxHrW8us1nPNf2LZw1h2MVp47dPVtEW3npZZnH8hXejqtTFdhrnPh2719oNVM1GqXvMqDLxu2u9eDbE5wKRqCQ8QjEf86bEabDCqJZFNXHD6WJZrKEyCmPV2MBfUU7JkbpcWtAjAkqsfsM8gvqK94xHm3vKgYF2Vzp11CxsaBt4HUrrAeJhAwFpfHyCvNJqcwhJVuEJgzNq9L2xomKxp3CTkxSez7tUdd4zabAknoH5MB98owve6v4WF8NtbByXFYGQmFjviMmZGgcwpHAvRJDXtQYPVJWvHpCVeALD9nByauUdmzipC15ZbsbdDW3imttheis2Hbtq46PydY5HuiiTv2Tg8om4VaAuJa9pHfVuBYbwoeDHrSKKxc5spzNgXGuBcdFXcw1XV9',
    [ChainType.Nervos]: null,
    [ChainType.Handshake]: null,
    [ChainType.Monero]: null,
    [ChainType.Firo]: null,
    [ChainType.Base]: null,
};
const rewardAddressesV2 = {
    [ChainType.Bitcoin]: '2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUpyGNdkxhFwQMhPKpx85Uu16put68V837wxDx19LRJ5uqi7xBa7EDFRU79Grzk8HDrfpUF3qct4xrQUvDofDroRQTuKueAbwybAfGDhNqG3jzKQchgjedBkbPAuDuNunehW4ZXUBLRSfqy3xofV76bxT5zpZjZcKud4XaRQvXUAVGunJzAs7RNZD5WZxenhmKzhiyuzWiq5QkWqxFw2h9vQ6Dd5PdYsWP3dPtaDC8WUjGz8tQ1tU9LuhqZ8QThQA5zBfoPFrk2iJ1repUuwZPjWnDRHLfWppqDQJGm2GEWHmYTQAfCJQFChUtSNstSATxw37xXjziKkPQRRVPr3VPapbHtGSoQyygzTHgcjxv3HSzwXkD7DScyA2iGDsd4B4WeXo4a6nM4CYpxa9f9FvabbNByhKsgq3ZoCsbUVXN99Pet93MFdxVmBBEsGYEYvtmMEDZEGb5z3JZDtVSdudFcm3bij82bdFzKSmmxxWZhscmLYpGGq1J5geqTiyTCgsmksAHumPFBmLkz8v843Jc3z5b6dwFgyXuBmQPTq6Nf8t95y1UYe8UYx3qNVfrHSGbToSgvCQyLKVv5ns8T2SZRWWr',
    [ChainType.Cardano]: '2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUskGdVdyYY5RBJnp3dfYC7iPoRNeopAFQWFwEbTieow347UhRyqvo2LntFpXzomvGwVTfq9YXS8Z1GGW5mUEioD5xC17Sz72NLbQrskSx7QZAxQTbMGh6vwM9J4q7NzRmQeHmWaHLpUHMU4Jdd5ccKumMvAY8d5C8RxB4iATySLY2N1wY84qNsWNaqkNofbUebf6LgmU9HTKAmU3nDoBfX7mhCjH8kXDhZeYdRsuLVFEYu83TkpwgHAYGmUoemxWAeA2BKMx8CBAy9jxbCyUjdnk9i7sLxuejrwLLh8W4tP81YkESjZ8BV65BhzPdvCaiX8vBSorgFfnvGKVzwfhhsSDwLY1GUwLTMLwTUTjSzEjsMX9hzsEEEmhxLsekabLmK3HZ1jssLrFryNuE59uS51hazJsi3gsT8SBk1J9YV6Dq6xto28nLqrMqK6raqLcAm2iU8hBtqdoSXqWzsrZHpqc2uLGhY52ee4k9TpFBvN1RovYUtY6KS4FncT4UgnbEFkzsnWYKX3CDn16tJs5CyZ97gKcvUonZ5EqTwabzni14CcQsTtKtEAqj1odvSyfJ94NnEjuiVPC3VmZbQvveN3bQ',
    [ChainType.Ergo]: '2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUmvtxr3QSv1aLwThLXxeqYCCc34xjxZDPqPyNGYvWLNeBZxATvBeDuQ6pSiiRFknqmvYVsm9eH4Et3eRHCyxDJEoqZsAahwfVSya34dZNHmjaPQkwWo3Coc17pxiEnWuWmG38wSJz1awE6cymzhojnjxDTbbXgjR1yfYU3AU2v9zttnT8Gz3gUzZNSwjiXSPu3G9zkDaFZVKqb5QwTWY3Pp6SFJgBQfx3C3sp4a9d3n9c98pfWFWAGQN5EfkoHosF8BQTDuzXG3NU8gVCNeNPXYA8iWCbvY3XpxQMvQUxqkjDv9VQfUNvAKVHLW43chi2rdBrQ7Teu6NnesLRWUKXpzSxpByWftkCCdBppjZtYmhhCHqpQGkQyTcMRoP2krFKe7xKbfnFkdkhaYH9TTdKuTuKtGb265RXxiqrc34KvkZpaBBQB5UvoCU4iLSDngNTjqkNPnWekDahzNHLd6CtcdC1B19jdGEXWeNADemDtdK4zrMNg7U8iVpyGYhLDnkeLVrcbhoxkHxrFwfrN19XvitDosQqmt9dseR6SWHBCDZJdmJecCiEwd2wBiwN5N5umEy3Dd4Hznv7kDr6eX7KtYxp',
    [ChainType.Ethereum]: '2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUpPyXf9D8PFkALkfhCu47xSApej3a8VHFCfLuQoMFV2LgTs6hEqRf2XQkDHzn3KYbGJ9b6gs2XcYf3ZQA2gJaWJXFErT11uifohMFFRJV7cb1eECubCbHCib3A434SJVrZee18QTRECrDirtC2GdZK6fiKGbGcKFTZWK4f3ChgnuZFCjRoCX2UquL25b2zkev34shFCspbYwYcyKmc5xxrvssUHgQmUZy7yu3RKJPXYuwH7SiittGsJ946spWJEp3cuBiMcpRvwbiCyrQqM1FtK3wZJKqy95bVDfj9zXwFfR1rE9wZADPs6xcJxi9P1z2iBXqPXGQHnKVaHJWEwNZfP2KAZeUi8etKnYSib68e5cuif3YNRVFdNtKAT2SJEsJCDmnUecmdCwvzMeH2EtNYsRBWVeTV4RBypRPi243qkFrct41bz6WZ8FhLFXU1tnExucXvQ48ZoQ4RQpNorEcGNDY8MC52yhkofS5b9wy6AYYjpQyTMmhD1QZF3VcQgPNT6x4yxPXYsjohYZh96h6M8T7m9gfVV3w8xowtVQVAB1kvJHMuZXxBkBNLwFbhxKuMwC2Dje3LZmuH9mhg94f7Uoe',
    [ChainType.Binance]: '2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUmAMWiE8WncsqsSRhckGHa5xwdGj7fCkypvX2Q9ypun1tUfQ8YwoXYgYCSF1M2t7WaUb2ZZzY9yETrdm8ywS3VzDFpirFEiLLgjE5vhsLkcW2PtiChF5npL3SFsxnSY92ZMmSw2U9GzhwDwTKXpPUD17dydf4CTbLATnCdiTkEYxCzVqh3XnBebDhEFSHWhCWVtqRniJJRqpRaAsv64qtBPabPG8HNRHT9TXFR4a58wH8VqdNuUSKHx1NQahaXTPYHfQX7H4mAzYU6fbH5uryhxqSh5HTBmCB8XrJcXCR41FeqjwrkwTiEHJkkyHVTeLdpyaUcHJ9M9nEsTbGbxMBLEc6CLtzRA5bDwFAKXN3i2mo86wUghaPMd72nd3pLDbhGYRntgYMrVWuVDzMhdJamVvFPbiEWiCs1BJ9NgJzasvJpJQxm1uBYskrWnULHQaJf8Kfoixaqcz6mcp2aAEAkoAmd3CcAddM4X1vCuapWeyaxLD7kXrHaafMsatugqJP4JQGFKEkXXBhthKScGLq5wcbYb2cVv6HuzyxyMg92UiLzTyFDB8QG2NwKgTfLGJ5iLDzzsFkPGtkxECDMVmiw21E',
    [ChainType.Doge]: '2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUkje1kCt7DSEufp9kN95BRzhkMTmgY2jmZ3gPH7hjfNkbPBkjLNifx5iH8wZ1EmiMFiWKozc1ZeT3QdnRhCtLZwHo5sBTek83753eK8YZNVgtykvcdLDbsgGyfCXZtJ2zxbNK7522JRormkeNkhLFBxC9u2tQ11EHyvcg8qHUhPA1GCXALUdtB1FkV2chfgewbDmtrpn7tqC7o3eaxQs3Ted3mo3TKmckYVWca7TqHnBCYGE1GRH2X3ZuWuSJXyi1AxKCyRi9JucVAGwpBhQPNR4viEZe5fo6kBiChWriCKmr7pti8685xoAz1ycFnLPKhbgdkwXmZtoLbYYrirEifkMJ1QXtaJStb86NQLQU2ThhqTzEkP22D8sRZ3Ud2b83KcxVvzzCvGeDRK7SkfjbmfhTCazJwwXiFTHBgT2tzfJvQTazwP6czcVC4taS55Ts2uKB4Z9Eu5MeWEvbBLBis8KxnkZkdMecxcBjRdAojCwyMBJUz8EPYo6x659TzbSJhjJiFaQ9f4kanVBV7nC9gK1rq5oY7bFH9MUcwGeu38HQk62kUbv7Q2dYx56CBVw6cHzdRJu6AXHY8dAy3BLqvHCV',
    [ChainType.Runes]: '2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUkvTLn8ZxbjUxBUfbKqvX55KDzYAKYt3ZKbqRCPuqoyroFuZ7Trm66GMmStkANyvdxLpKBNo93c6zjtuWAiV6NDw5hxCj1DJE8trc6nfcnKoeF3jvMyn8RxWxFiRKtShRsRZ84y5FKRgAwhwDWqw57qsNQ3WfPFwnP3F8XWa2sUYGb1ECxMTtyLNP1Tijz9L1rZYgVGrRKtdWEwkoH5GiA7xYntzevHu6ttL8dxqNzn8eHE29x1dJ32prcgGRXYG4nhD5v9RV3UskZUR5EPVQLZWF623vKTU97o46qjAvv5qjDuWXnWSwv8UfeZXNhsq6GNUs4NExpR192TwNvQqGZVgwh8NTg2tj6k78qyLD3MVFn5CuLBqa8QLnS2NoYsbddgCAsFwPW4uj8sUR1hAzT3epqFssH4B4fdwwUDRqGVZfmjAuTr2uHdMThhq652v52esKvaSC43khGAW8ixmo3xkUTdqUtN9X4TRiQkw8PxuwVUxHB9Ux2JugkMKhQK1rzyUTCN9JAfU4S4hdKGKRBF3papEAuE8s76dvboioa5VANbY8JZAMpgdnECCxxtXqcRDkwvVoX9Pn1JLjtizPq4Uf',
    [ChainType.Nervos]: null,
    [ChainType.Handshake]: null,
    [ChainType.Monero]: null,
    [ChainType.Firo]: null,
    [ChainType.Base]: null,
};
const hotWalletAddress = 'nB3L2PD3J4rMmyGk7nnNdESpPXxhPRQ4t1chF8LTXtceMQjKCEgL2pFjPY6cehGjyEFZyHEomBTFXZyqfonvxDozrTtK5JzatD8SdmcPeJNWPvdRb5UxEMXE4WQtpAFzt2veT8Z6bmoWN';
/**
 * Determines the ChainType based on the provided address.
 * @param address The address to evaluate.
 * @returns The corresponding ChainType or null if not found.
 */
function getChainType(address) {
    if (!address)
        return undefined;
    for (const [chain, addr] of Object.entries(rewardAddresses)) {
        if (addr === address) {
            return chain;
        }
    }
    for (const [chain, addr] of Object.entries(rewardAddressesV2)) {
        if (addr === address) {
            return chain;
        }
    }
    return null;
}
function getChainTypeForPermitAddress(address) {
    if (!address)
        return undefined;
    for (const [chain, addr] of Object.entries(permitAddresses)) {
        if (addr === address) {
            return chain;
        }
    }
    return null;
}
if (typeof window !== 'undefined') {
    globalThis.ChainType = ChainType;
    globalThis.getChainType = getChainType;
    globalThis.getChainTypeForPermitAddress = getChainTypeForPermitAddress;
    globalThis.permitAddresses = permitAddresses;
    globalThis.rewardAddresses = rewardAddresses;
    globalThis.permitTriggerAddresses = permitTriggerAddresses;
    globalThis.permitBulkAddresses = permitBulkAddresses;
    globalThis.hotWalletAddress = hotWalletAddress;
    globalThis.rwtTokenIds = rwtTokenIds;
    globalThis.getActiveChainTypes = getActiveChainTypes;
    globalThis.chainTypeWatcherIdentifier = chainTypeWatcherIdentifier;
    globalThis.chainTypeTokens = chainTypeTokens;
    globalThis.getChainTypes = getChainTypes;
}
class IDBDatabaseStorageService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getData(storeName) {
        return new Promise((resolve, reject) => {
            const start = typeof performance !== 'undefined' && performance.now
                ? performance.now()
                : Date.now();
            const label = `StorageService:getData(${storeName})`;
            const tx = this.db.transaction([storeName], 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => {
                const result = request.result;
                const end = typeof performance !== 'undefined' && performance.now
                    ? performance.now()
                    : Date.now();
                const duration = Math.round(end - start);
                console.log(`${label} - loaded ${result.length} items in ${duration}ms`);
                resolve(result);
            };
            request.onerror = e => reject(e.target.error);
        });
    }
    async getDataById(storeName, id) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ?? null);
            };
            request.onerror = e => reject(e.target.error);
        });
    }
    async addData(storeName, data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readwrite');
            const store = tx.objectStore(storeName);
            Promise.all(data.map(item => new Promise((res, rej) => {
                const req = store.put(item);
                req.onsuccess = () => res();
                req.onerror = e => rej(e.target.error);
            })))
                .then(() => resolve())
                .catch(reject);
        });
    }
    async deleteData(storeName, keys) {
        const arr = Array.isArray(keys) ? keys : [keys];
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readwrite');
            const store = tx.objectStore(storeName);
            Promise.all(arr.map(key => new Promise((res, rej) => {
                const req = store.delete(key);
                req.onsuccess = () => res();
                req.onerror = e => rej(e.target.error);
            })))
                .then(() => resolve())
                .catch(reject);
        });
    }
}
// Define the singleton at module scope
const processEventServiceSingleton = (() => {
    console.log('Initializing ProcessEventService singleton factory');
    let instance = null;
    return () => {
        if (!instance) {
            console.log('Creating new ProcessEventService instance');
            instance = new ProcessEventService(new ServiceWorkerEventSender());
        }
        return instance;
    };
})();
if (typeof self !== 'undefined') {
    self.addEventListener('message', async (event) => {
        const processEventService = processEventServiceSingleton();
        const data = event.data;
        console.log(`Rosen service worker received event of type ${data.type}`);
        processEventService.processEvent({
            data: data.data,
            type: data.type,
        });
    });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ChartService {
    async getAddressCharts(inputs) {
        const addressCharts = {};
        inputs.forEach((input) => {
            input.assets.forEach((asset) => {
                if (!addressCharts[input.outputAddress]) {
                    addressCharts[input.outputAddress] = { charts: {}, chainType: null };
                }
                const currentDate = new Date();
                const halfYearAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
                if (input.inputDate > halfYearAgo) {
                    const dt = new Date(input.inputDate.getFullYear(), input.inputDate.getMonth(), input.inputDate.getDate() - input.inputDate.getDay()).getTime();
                    if (!addressCharts[input.outputAddress].charts[dt]) {
                        addressCharts[input.outputAddress].charts[dt] = 0;
                    }
                    addressCharts[input.outputAddress].charts[dt] +=
                        asset.amount / Math.pow(10, asset.decimals);
                    addressCharts[input.outputAddress].chainType =
                        input.chainType ?? getChainType(input.address);
                }
            });
        });
        return addressCharts;
    }
    async getAmountsByDate(inputs, period) {
        const reducedInputs = this.reduceData(inputs, period);
        const amounts = reducedInputs.map((s) => {
            return { x: s.inputDate, y: s.amount };
        });
        return amounts;
    }
    reduceData(inputs, period) {
        const date = new Date();
        switch (period) {
            case 'Day':
                date.setDate(date.getDate() - 1);
                break;
            case 'Week':
                date.setDate(date.getDate() - 7);
                break;
            case 'Month':
                date.setMonth(date.getMonth() - 1);
                break;
            case 'Year':
                date.setFullYear(date.getFullYear() - 1);
                break;
            default:
                date.setFullYear(date.getFullYear() - 100);
        }
        inputs = inputs.filter((r) => r.inputDate >= date);
        return inputs;
    }
}
class MemoryStorageService {
    getMemoryStore() {
        const g = globalThis;
        if (!g.__storageServiceStore) {
            g.__storageServiceStore = {};
        }
        return g.__storageServiceStore;
    }
    generateKey(storeName, key) {
        if (Array.isArray(key)) {
            return storeName + ':' + key.map(k => String(k)).join(',');
        }
        return storeName + ':' + String(key);
    }
    async getData(storeName) {
        return new Promise((resolve) => {
            const start = typeof performance !== 'undefined' && performance.now
                ? performance.now()
                : Date.now();
            const store = this.getMemoryStore();
            const prefix = storeName + ':';
            const result = Object.keys(store)
                .filter(key => key.startsWith(prefix))
                .map(key => store[key]);
            const end = typeof performance !== 'undefined' && performance.now
                ? performance.now()
                : Date.now();
            const duration = Math.round(end - start);
            console.log(`StorageService:getData(${storeName}) - loaded ${result.length} items in ${duration}ms`);
            resolve(result);
        });
    }
    async getDataById(storeName, id) {
        return new Promise((resolve) => {
            const key = this.generateKey(storeName, id);
            const store = this.getMemoryStore();
            resolve(store[key] ?? null);
        });
    }
    async addData(storeName, data) {
        return new Promise((resolve) => {
            const store = this.getMemoryStore();
            data.forEach(item => {
                const id = item.id ?? Math.random().toString(36).slice(2); // fallback id if missing
                const key = this.generateKey(storeName, id);
                store[key] = item;
            });
            resolve();
        });
    }
    async deleteData(storeName, keys) {
        const arr = Array.isArray(keys) ? keys : [keys];
        return new Promise((resolve) => {
            const store = this.getMemoryStore();
            arr.forEach(key => {
                const storageKey = this.generateKey(storeName, key);
                delete store[storageKey];
            });
            resolve();
        });
    }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
const rs_DbName = 'rosenDatabase_1.1.5';
const rs_DbVersion = 39;
const rs_InputsStoreName = 'inputBoxes';
const rs_PerfTxStoreName = 'perfTxs';
const rs_PermitTxStoreName = 'permitTxs';
const rs_ActivePermitTxStoreName = 'activePermitTxs';
const rs_DownloadStatusStoreName = 'downloadStatusStore';
const rs_OpenBoxesStoreName = 'openBoxesStore';
const rs_AddressDataStoreName = 'addressData';
const rs_InitialNDownloads = 30;
const rs_FullDownloadsBatchSize = 400;
const rs_PerfInitialNDownloads = 10;
const rs_PerfFullDownloadsBatchSize = 40;
const rs_StartFrom = new Date('2024-01-01');
const rs_Input_Key = ['boxId', 'outputAddress'];
const rs_Permit_Key = 'id';
const rs_ActivePermit_Key = 'id';
const rs_PerfTx_Key = 'id';
const rs_Address_Key = 'address';
const rs_PermitCost = 3000;
const rs_WatcherCollateralRSN = (chainType) => {
    if (chainType === ChainType.Runes) {
        return 50000;
    }
    else {
        return 30000;
    }
};
const rs_WatcherCollateralERG = (chainType) => {
    if (chainType === ChainType.Runes) {
        return 10;
    }
    else {
        return 800;
    }
};
const rs_ErgoExplorerHost = 'api.ergoplatform.com';
const rs_ErgoNodeHost = 'https://node-p2p.ergoplatform.com';
//const rs_ErgoNodeHost = 'localhost:9053';
//const rs_ErgoExplorerHost = 'node-p2p.ergoplatform.com';
// https://node-p2p.ergoplatform.com/swagger
/*

https://api.ergoplatform.com/api/v1/docs/
https://api-p2p.ergoplatform.com/api/v1/docs/
https://api.ergo.aap.cornell.edu/api/v1/docs/
https://api.ergobackup.aap.cornell.edu/api/v1/docs/
https://api.codeutxo.com/api/v1/docs/

*/
const rs_RSNTokenId = '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';
const rs_eRSNTokenId = 'dede2cf5c1a2966453ffec198a9b97b53d281e548903a905519b3525d59cdc3c';
const rs_TokenIdMap = {
    [rs_RSNTokenId]: 'RSN',
    [rs_eRSNTokenId]: 'eRSN',
};
const rs_RSNDecimals = 3;
var Period;
(function (Period) {
    Period["Day"] = "Day";
    Period["Week"] = "Week";
    Period["Month"] = "Month";
    Period["Year"] = "year";
    Period["All"] = "All";
})(Period || (Period = {}));
var Currency;
(function (Currency) {
    Currency["EUR"] = "EUR";
    Currency["USD"] = "USD";
    Currency["ERG"] = "ERG";
    Currency["RSN"] = "RSN";
})(Currency || (Currency = {}));
if (typeof window !== 'undefined') {
    globalThis.rs_DbName = rs_DbName;
    globalThis.rs_DbVersion = rs_DbVersion;
    globalThis.rs_InputsStoreName = rs_InputsStoreName;
    globalThis.rs_PerfTxStoreName = rs_PerfTxStoreName;
    globalThis.rs_PermitTxStoreName = rs_PermitTxStoreName;
    globalThis.rs_ActivePermitTxStoreName = rs_ActivePermitTxStoreName;
    globalThis.rs_DownloadStatusStoreName = rs_DownloadStatusStoreName;
    globalThis.rs_OpenBoxesStoreName = rs_OpenBoxesStoreName;
    globalThis.rs_AddressDataStoreName = rs_AddressDataStoreName;
    globalThis.rs_InitialNDownloads = rs_InitialNDownloads;
    globalThis.rs_FullDownloadsBatchSize = rs_FullDownloadsBatchSize;
    globalThis.rs_StartFrom = rs_StartFrom;
    globalThis.rs_Input_Key = rs_Input_Key;
    globalThis.rs_PerfTx_Key = rs_PerfTx_Key;
    globalThis.rs_Permit_Key = rs_Permit_Key;
    globalThis.rs_ActivePermit_Key = rs_ActivePermit_Key;
    globalThis.rs_Address_Key = rs_Address_Key;
    globalThis.rs_PermitCost = rs_PermitCost;
    globalThis.rs_WatcherCollateralRSN = rs_WatcherCollateralRSN;
    globalThis.rs_WatcherCollateralERG = rs_WatcherCollateralERG;
    globalThis.rs_PerfInitialNDownloads = rs_PerfInitialNDownloads;
    globalThis.rs_PerfFullDownloadsBatchSize = rs_PerfFullDownloadsBatchSize;
    globalThis.rs_ErgoExplorerHost = rs_ErgoExplorerHost;
    globalThis.rs_ErgoNodeHost = rs_ErgoNodeHost;
    globalThis.rs_RSNTokenId = rs_RSNTokenId;
    globalThis.rs_eRSNTokenId = rs_eRSNTokenId;
    globalThis.rs_TokenIdMap = rs_TokenIdMap;
    globalThis.rs_RSNDecimals = rs_RSNDecimals;
    globalThis.currencies = Object.values(Currency);
    window.Period = Period;
    window.Currency = Currency;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class WatcherDataService extends DataService {
    activePermitsDataService;
    getData() {
        return this.storageService.getData(rs_PermitTxStoreName);
    }
    async getExistingData(transaction, address) {
        for (const input of transaction.inputs) {
            if (input.boxId) {
                const data = await this.storageService.getDataById(rs_PermitTxStoreName, this.createUniqueId(input.boxId, transaction.id, address));
                if (data) {
                    return data;
                }
            }
        }
        for (const output of transaction.outputs) {
            if (output.boxId) {
                const data = await this.storageService.getDataById(rs_PermitTxStoreName, this.createUniqueId(output.boxId, transaction.id, address));
                if (data) {
                    return data;
                }
            }
        }
        return null;
    }
    constructor(activePermitsDataService) {
        super(activePermitsDataService.storageService);
        this.activePermitsDataService = activePermitsDataService;
    }
    createUniqueId(boxId, transactionId, address) {
        const str = `${transactionId}_${boxId}_${address}`;
        let hash = 0, i, chr;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0;
        }
        return hash.toString();
    }
    getDataType() {
        return 'permit';
    }
    async getWatcherPermits() {
        const permitsPromise = this.storageService.getData(rs_PermitTxStoreName);
        console.log('Retrieving watcher permits and such');
        try {
            const permits = await permitsPromise;
            permits.forEach((permit) => {
                permit.assets = permit.assets
                    .filter((asset) => asset.tokenId == rs_RSNTokenId)
                    .map((asset_1) => {
                    return asset_1;
                });
            });
            permits.sort((a, b) => b.date.getTime() - a.date.getTime());
            return await new Promise((resolve) => {
                resolve(permits);
            });
        }
        catch (error) {
            console.error(error);
            return [];
        }
    }
    shouldAddToDb(address, assets) {
        return (address != null &&
            address.length > 0 &&
            address.length <= 100 &&
            assets.some((asset) => asset.tokenId == rs_RSNTokenId));
    }
    async getAdressPermits(addresses) {
        const permits = await this.getWatcherPermits();
        const widSums = {};
        const permitInfo = [];
        for (const permit of permits) {
            const sum = permit.assets.reduce((acc, asset) => {
                if (asset.tokenId == rs_RSNTokenId) {
                    return acc + asset.amount / Math.pow(10, rs_RSNDecimals);
                }
                return acc;
            }, 0);
            if (widSums[permit.wid]) {
                widSums[permit.wid] += sum;
            }
            else {
                widSums[permit.wid] = sum;
            }
        }
        for (const permit of permits) {
            if (!permitInfo.some((p) => p.address == permit.address)) {
                permitInfo.push({
                    address: permit.address,
                    wid: permit.wid,
                    lockedRSN: widSums[permit.wid] || 0,
                    activeLockedRSN: 0,
                    chainType: permit.chainType,
                });
            }
        }
        let addressActivePermits = await this.activePermitsDataService.getAdressPermits(true, null, null, null, null, addresses);
        for (const activePermit of addressActivePermits) {
            const info = permitInfo.find((p) => p.address === activePermit.address);
            if (info) {
                info.activeLockedRSN += rs_PermitCost;
            }
        }
        return permitInfo;
    }
    async addData(address, transactions) {
        const tempData = [];
        transactions.forEach((item) => {
            let iwids = item.inputs
                .flatMap((input) => input.assets)
                .filter((asset) => asset.amount == 2 || asset.amount == 3)
                .flatMap((a) => a.tokenId);
            let owids = item.outputs
                .flatMap((output) => output.assets)
                .filter((asset) => asset.amount == 2 || asset.amount == 3)
                .flatMap((a) => a.tokenId);
            const allWids = Array.from(new Set([...iwids, ...owids]));
            item.inputs.forEach((input) => {
                if (this.shouldAddToDb(input.address, input.assets) === false) {
                    return;
                }
                input.inputDate = new Date(item.timestamp);
                input.assets = input.assets.filter((a) => a.tokenId == rs_RSNTokenId || a.amount == 2 || a.amount == 3);
                let wid;
                for (wid of allWids) {
                    const PermitTx = {
                        id: this.createUniqueId(input.boxId, item.id, address),
                        address: input.address,
                        date: input.inputDate,
                        boxId: input.boxId,
                        assets: input.assets || [],
                        wid: wid ?? '',
                        chainType: getChainTypeForPermitAddress(address),
                        transactionId: item.id,
                    };
                    if (PermitTx.assets.length > 0) {
                        tempData.push(PermitTx);
                    }
                }
            });
            item.outputs.forEach((output) => {
                if (this.shouldAddToDb(output.address, output.assets) === false) {
                    return;
                }
                output.outputDate = new Date(item.timestamp);
                output.assets = output.assets.filter((a) => a.tokenId == rs_RSNTokenId || a.amount == 2 || a.amount == 3);
                output.assets.forEach((a) => {
                    a.amount = -a.amount;
                });
                let wid;
                for (wid of allWids) {
                    const PermitTx = {
                        id: this.createUniqueId(output.boxId, item.id, address),
                        address: output.address,
                        date: output.outputDate,
                        boxId: output.boxId,
                        assets: output.assets || [],
                        wid: wid ?? '',
                        chainType: getChainTypeForPermitAddress(address),
                        transactionId: item.id,
                    };
                    if (PermitTx.assets.length > 0) {
                        tempData.push(PermitTx);
                    }
                }
            });
        });
        await this.storageService.addData(rs_PermitTxStoreName, tempData);
    }
    async getSortedPermits() {
        const permitsPromise = await this.getWatcherPermits();
        const sortedPermits = [];
        console.log('start retrieving permits from database');
        try {
            const permits = await permitsPromise;
            permits.forEach((permitTx) => {
                sortedPermits.push({
                    id: permitTx.id,
                    date: permitTx.date,
                    address: permitTx.address,
                    assets: permitTx.assets,
                    wid: permitTx.wid,
                    boxId: permitTx.boxId,
                    chainType: permitTx.chainType ??
                        getChainTypeForPermitAddress(permitTx.address),
                    transactionId: permitTx.transactionId,
                });
            });
            console.log('done retrieving permits from database ' + permits.length + ' permits');
            return await new Promise((resolve) => {
                resolve(sortedPermits);
            });
        }
        catch (error) {
            console.error(error);
            return sortedPermits;
        }
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ServiceWorkerEventSender {
    async sendEvent(event) {
        const clientsList = await self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
        });
        for (const client of clientsList) {
            client.postMessage(event);
        }
    }
}
class ProcessEventService {
    eventSender;
    services = null;
    constructor(eventSender) {
        this.eventSender = eventSender;
    }
    async initServices() {
        //if (this.services) return this.services;
        const db = await this.initIndexedDB();
        const chartService = new ChartService();
        const rewardDataService = new RewardDataService(db, chartService, this.eventSender);
        const activepermitsDataService = new ActivePermitsDataService(db);
        const watcherDataService = new WatcherDataService(activepermitsDataService);
        const chainPerformanceDataService = new ChainPerformanceDataService(db, this.eventSender);
        const downloadStatusIndexedDbRewardDataService = new DownloadStatusIndexedDbService(rewardDataService, db);
        const downloadStatusIndexedDbWatcherDataService = new DownloadStatusIndexedDbService(watcherDataService, db);
        const downloadStatusIndexedDbActivePermitsDataService = new DownloadStatusIndexedDbService(activepermitsDataService, db);
        const downloadStatusIndexedDbChainPerformanceDataService = new DownloadStatusIndexedDbService(chainPerformanceDataService, db);
        const downloadService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, rewardDataService, this.eventSender, downloadStatusIndexedDbRewardDataService);
        const downloadMyWatchersService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, watcherDataService, this.eventSender, downloadStatusIndexedDbWatcherDataService);
        const downloadActivePermitsService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, activepermitsDataService, this.eventSender, downloadStatusIndexedDbActivePermitsDataService);
        const downloadPerfService = new DownloadService(rs_PerfFullDownloadsBatchSize, rs_PerfInitialNDownloads, chainPerformanceDataService, this.eventSender, downloadStatusIndexedDbChainPerformanceDataService);
        this.services = {
            dataService: rewardDataService,
            chainPerformanceDataService: chainPerformanceDataService,
            watcherDataService,
            downloadService,
            chartService,
            downloadPerfService: downloadPerfService,
            downloadMyWatchersService: downloadMyWatchersService,
            downloadActivePermitsService: downloadActivePermitsService,
            activePermitsDataService: activepermitsDataService,
        };
        return this.services;
    }
    async processEvent(event) {
        if (event.type === 'StatisticsScreenLoaded' ||
            event.type === 'PerformanceScreenLoaded' ||
            event.type === 'MyWatchersScreenLoaded' ||
            event.type === 'RequestInputsDownload') {
            const { dataService, downloadService, downloadPerfService, downloadMyWatchersService, downloadActivePermitsService, chartService, chainPerformanceDataService, watcherDataService, activePermitsDataService, } = await this.initServices();
            if (event.type === 'RequestInputsDownload') {
                await this.processRequestInputsDownload(event, chartService, dataService, downloadService);
            }
            else if (event.type === 'StatisticsScreenLoaded') {
                await this.processStatisticsScreenLoaded(dataService, downloadService);
            }
            else if (event.type === 'MyWatchersScreenLoaded') {
                await this.processMyWatchersScreenLoaded(event, watcherDataService, downloadMyWatchersService, activePermitsDataService, downloadActivePermitsService);
            }
            else if (event.type === 'PerformanceScreenLoaded') {
                await this.processPerformanceScreenLoaded(chainPerformanceDataService, downloadPerfService);
            }
        }
    }
    async processPerformanceScreenLoaded(chainPerformanceDataService, downloadPerfService) {
        console.log('Rosen service worker received PerformanceScreenLoaded');
        try {
            console.log('Downloading perftxs.');
            const perfTxs = await chainPerformanceDataService.getPerfTxs();
            this.eventSender?.sendEvent({
                type: 'PerfChartChanged',
                data: perfTxs,
            });
            downloadPerfService.downloadForAddress(hotWalletAddress, true);
        }
        catch (error) {
            console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
    }
    async processMyWatchersScreenLoaded(event, watcherDataService, downloadMyWatchersService, activePermitsDataService, downloadActivePermitsService) {
        const addresses = event.data
            .addresses;
        console.log('Rosen service worker received MyWatchersScreenLoaded initiating syncing of data by downloading from blockchain');
        try {
            let permits = await watcherDataService.getAdressPermits(addresses);
            let chainTypes = this.extractChaintTypes(permits, addresses);
            this.sendPermitsChangedEvent(permits);
            if (chainTypes.size === 0) {
                await this.downloadForChainPermitAddresses(addresses, downloadMyWatchersService, watcherDataService);
                permits = await this.sendPermitChangedEvent(watcherDataService, addresses);
                let chainTypes = this.extractChaintTypes(permits, addresses);
                await this.processActivePermits(chainTypes, activePermitsDataService, watcherDataService, addresses, downloadActivePermitsService);
            }
            else {
                await this.processActivePermits(chainTypes, activePermitsDataService, watcherDataService, addresses, downloadActivePermitsService);
                await this.downloadForChainPermitAddresses(addresses, downloadMyWatchersService, watcherDataService);
                await this.sendPermitChangedEvent(watcherDataService, addresses);
                let newChainTypes = this.extractChaintTypes(await watcherDataService.getAdressPermits(addresses), addresses);
                if (newChainTypes.size !== chainTypes.size ||
                    [...newChainTypes].some((ct) => !chainTypes.has(ct))) {
                    await this.processActivePermits(newChainTypes, activePermitsDataService, watcherDataService, addresses, downloadActivePermitsService);
                }
            }
        }
        catch (error) {
            console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
    }
    extractChaintTypes(permits, addresses) {
        let chainTypes = new Set();
        for (const permit of Object.values(permits)) {
            if (permit && permit.chainType && addresses.includes(permit.address)) {
                chainTypes.add(permit.chainType);
            }
        }
        return chainTypes;
    }
    async processActivePermits(chainTypes, activePermitsDataService, watcherDataService, addresses, downloadActivePermitsService) {
        await Promise.all(Array.from(chainTypes).map(async (chainType) => {
            await activePermitsDataService.downloadOpenBoxes(chainType);
        }));
        await this.sendPermitChangedEvent(watcherDataService, addresses);
        await Promise.all(Array.from(chainTypes).map(async (chainType) => {
            await this.downloadForActivePermitAddresses(addresses, chainType, downloadActivePermitsService, watcherDataService);
        }));
    }
    async downloadForChainPermitAddresses(addresses, downloadMyWatchersService, watcherDataService) {
        try {
            const downloadPromises = Object.entries(permitAddresses)
                .filter(([, address]) => address != null)
                .map(async ([chainType, address]) => {
                await downloadMyWatchersService.downloadForAddress(address, true);
                const permits = await watcherDataService.getAdressPermits(addresses);
                await this.eventSender?.sendEvent({
                    type: 'PermitsChanged',
                    data: permits,
                });
                await this.eventSender?.sendEvent({
                    type: 'AddressPermitsDownloaded',
                    data: chainType,
                });
            });
            await Promise.all(downloadPromises);
        }
        catch (e) {
            console.error('Error downloading for addresses:', e);
        }
    }
    async sendPermitChangedEvent(watcherDataService, addresses) {
        let permits = await watcherDataService.getAdressPermits(addresses);
        this.eventSender?.sendEvent({
            type: 'PermitsChanged',
            data: permits,
        });
        return permits;
    }
    sendPermitsChangedEvent(permits) {
        this.eventSender?.sendEvent({
            type: 'PermitsChanged',
            data: permits,
        });
    }
    async processStatisticsScreenLoaded(dataService, downloadService) {
        console.log('Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain');
        try {
            const inputs = await dataService.getSortedInputs();
            this.eventSender?.sendEvent({
                type: 'InputsChanged',
                data: inputs,
            });
            await downloadService.downloadForAddresses();
        }
        catch (error) {
            console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
    }
    async downloadForActivePermitAddresses(allAddresses, chainType, downloadActivePermitsService, watcherDataService) {
        try {
            let addresses = [];
            Object.entries(permitTriggerAddresses).forEach(([key, address]) => {
                if (key === chainType && address != null) {
                    addresses.push(address);
                }
            });
            const downloadPromises = addresses.map(async (address) => {
                await downloadActivePermitsService.downloadForAddress(address, true, async () => {
                    try {
                        const permits = await watcherDataService.getAdressPermits(allAddresses);
                        await this.eventSender?.sendEvent({
                            type: 'PermitsChanged',
                            data: permits,
                        });
                    }
                    catch (err) {
                        console.error('Error in permits callback:', err);
                    }
                });
            });
            await Promise.all(downloadPromises);
        }
        catch (e) {
            console.error('Error downloading for addresses:', e);
        }
    }
    async processRequestInputsDownload(event, chartService, dataService, downloadService) {
        console.log('Rosen service worker received RequestInputsDownload initiating syncing of data by downloading from blockchain, event.data: ' +
            event.data);
        try {
            const addressCharts = await chartService.getAddressCharts(await dataService.getSortedInputs());
            this.eventSender?.sendEvent({
                type: 'AddressChartChanged',
                data: addressCharts,
            });
            if (event.data && typeof event.data === 'string') {
                await downloadService.downloadForAddress(event.data, true);
            }
            else {
                await downloadService.downloadForAddresses();
            }
        }
        catch (error) {
            console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
    }
    // IndexedDB Initialization
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            let dbName = rs_DbName;
            const request = indexedDB.open(dbName);
            request.onsuccess = (event) => {
                const db = event.target.result;
                resolve(db);
            };
            request.onerror = (event) => {
                console.error('Error opening IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
if (typeof window !== 'undefined') {
    window.ProcessEventService = ProcessEventService;
    globalThis.CreateProcessEventService = (eventSender) => {
        return new ProcessEventService(eventSender);
    };
}
// service/src/exports/index.ts
function GetActivePermitsDownloadService(maxDownloadDateDifference) {
  return globalThis.CreateActivePermitsDownloadService(maxDownloadDateDifference, null);
}

// apps/server/watcherstats/src/main.ts
async function main() {
  await downloadActivePermits();
}
main().catch(console.error);
async function downloadActivePermits() {
  var frommonth = 1;
  var fromyear = 2026;
  var tomonth = 1;
  var toyear = 2026;
  const now = /* @__PURE__ */ new Date();
  const startOfYear = new Date(fromyear, frommonth - 1, 1);
  var diff = now.getTime() - startOfYear.getTime() + 2 * 24 * 60 * 60 * 1e3;
  var downloadService = GetActivePermitsDownloadService(diff);
  await downloadService.downloadForAddress(
    "5ivrmzxYZc1s5aYrsy9uMd3wphLaHx4Kqrw7wVDwQdtj967D3qYpAw15uAr1CK4RbXKFW7kersNNe9tXu22iut2zG7tCmAP9TzSNgHMSJFBzR9y7vmqpmTGyFmn6poS81E8MzwaJ2MxkULFoS2nj7CwVsCMGweg84sJShZkGm81jxw6N65GHddQ4sJsBJb6MYFcVXeLxrgnEMPd3eFH7XoVj5uM97P6rsUAztZmeaA9hdUkc9Bz497j5BKQaiXyrFj8ghEtL1cemwfnGrsybkuq132QT9qsW7dNaG95D5wSYNUoAP7mVcziPas1PvEa5xRgMKnvE4ByYPT6BfkAMijYfXSDLzi1EbksurZGfC6jX7jfSgwuugXMNbjrUwhzj6657H9MsytUxRW8kNUKN7mwUphQGFS3nWLG4hzyas5BF8MnK7usWD7MJko7FaUWwNPVrRdatwB5uu6rUrY8UeAW9DPQMrL6VZWMKMWFmoY722pVYHdMdCsehR3CnsRDGDpZtvdqJnGgn2czeZ4AfK8o6aykw3HMTvNP2e6pxNt6FYgr2WZhbXsmeqA6bG7t9JNCw6H7tA8KJPAN1X6CYeZMitX5RWCrMtrSy2NEDepNvMgH3n4GD3tvS5Rs94gFVWHfLu4JM5BaTwfRTcdfirnwPQhYhtH6SEc8b5SgGkraojn4JgkKGp2ftszDUNyaKrY8XJQusuMG64Aoe96wr2AaRKKtUhAKfk7kUXHtGoV3h4MhDy5Wnbgb6hXcmQoMQ8HnT7JMAFWUUeWyveNn3hdNucDf2WtmXBsRpwUidapBJPD9Xukw6uEsWdkzsCNcdhZM4EqnkadRKziCubVx52TYoxDYqupyLssPc6JdaLUWny1Nh2vsEdnuNYXj82iX7AeJRaHJeyn8wytA7G8NwQXp2THTniwF6hPCWTub5khfdJ2g4VDTv14GRL88NA6w49N5FaG2ZWxqgRKYxbEJqgBE91KWHoXfsB4qvo6cGfMwpeJU5g6FTiexmXZqrNpRwmnnx1NTGK4TdqnksfaXZPMfPBbdJnQu1vfGwLuMkP5f5EvyfQ4KzazA67AxoabFYkKJk4pvVkRqaWUps9b3nkZhErUMAgxYR4raNtKHSUT13c9RMaGQmtV8viR4b7Z2JoKjqiEP9xGVoZBANhDpJ3EpihvRmDuy7MAZfy1qEm59spvdgdPPEiffw8GBv9MyDfsAGNSzsMhiP1f8WKXduWy7AdEJZTrBJkLZFPTaRHHyU9XvbRyzrxhV87thVrfRhv88hN6Viw2CyRdMJUPmVt",
    true
  );
  var permits = await downloadService.getDataService().getAdressPermits(false, frommonth, fromyear, tomonth, toyear);
  const byAddress = permits.reduce((map, p) => {
    const addr = p.address || "";
    const d = p.date ? new Date(p.date) : null;
    const assetsLen = p.assets && Array.isArray(p.assets) ? p.assets.length : 0;
    let entry = map.get(addr);
    if (!entry) {
      entry = { address: addr, count: 0, assetsCount: 0, earliest: d, latest: d };
      map.set(addr, entry);
    }
    entry.count += 1;
    entry.assetsCount += assetsLen;
    if (d) {
      if (!entry.earliest || d < entry.earliest) entry.earliest = d;
      if (!entry.latest || d > entry.latest) entry.latest = d;
    }
    return map;
  }, /* @__PURE__ */ new Map());
  const totalsPerAddress = Array.from(byAddress.values()).map((e) => ({
    address: e.address,
    totalPermits: e.count,
    totalAssets: e.assetsCount,
    earliest: e.earliest ? e.earliest.toISOString() : null,
    latest: e.latest ? e.latest.toISOString() : null
  })).sort((a, b) => b.totalPermits - a.totalPermits || a.address.localeCompare(b.address));
  console.log("totalsPerAddress:", totalsPerAddress);
}
