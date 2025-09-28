// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DownloadService {
    dataService;
    myWatcherDataService;
    eventSender;
    db;
    busyCounter = 0;
    downloadFullSize = rs_FullDownloadsBatchSize;
    downloadInitialSize = rs_InitialNDownloads;
    //private static addressDownloadDateMap = new Map<string, Date>();
    constructor(downloadFullSize, downloadInitialSize, dataService, myWatcherDataService, eventSender, db) {
        this.dataService = dataService;
        this.myWatcherDataService = myWatcherDataService;
        this.eventSender = eventSender;
        this.db = db;
        this.downloadFullSize = downloadFullSize;
        this.downloadInitialSize = downloadInitialSize;
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
            const url = `https://${rs_ErgoNodeHost}/blockchain/transaction/byAddress?offset=${offset}&limit=${limit}`;
            console.log(`Downloading from: ${url}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
            const addresses = await this.dataService.getData(rs_AddressDataStoreName);
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
    async downloadForChainPermitAddresses() {
        try {
            const downloadPromises = Object.entries(permitAddresses)
                .filter(([, address]) => address != null)
                .map(async ([chainType, address]) => {
                await this.downloadForAddress(address, true);
                this.eventSender.sendEvent({
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
    async downloadForActivePermitAddresses(chainType) {
        try {
            let addresses = [];
            Object.entries(permitTriggerAddresses).forEach(([key, address]) => {
                if (key === chainType && address != null) {
                    addresses.push(address);
                }
            });
            const downloadPromises = addresses.map(async (address) => {
                await this.downloadForAddress(address, true);
                let permits = await this.myWatcherDataService.getAdressPermits();
                this.eventSender.sendEvent({
                    type: 'PermitsChanged',
                    data: permits,
                });
            });
            await Promise.all(downloadPromises);
        }
        catch (e) {
            console.error('Error downloading for addresses:', e);
        }
    }
    // Busy Counter
    increaseBusyCounter(address) {
        if (this.busyCounter === 0) {
            this.eventSender.sendEvent({
                type: 'StartFullDownload',
                data: address,
            });
        }
        this.busyCounter++;
    }
    decreaseBusyCounter(address) {
        this.busyCounter--;
        if (this.busyCounter === 0) {
            this.eventSender.sendEvent({
                type: 'EndFullDownload',
                data: address,
            });
        }
    }
    // Download All for Address (recursive)
    async downloadAllForAddress(address, offset, db, useNode) {
        this.increaseBusyCounter(address);
        console.log(this.busyCounter);
        try {
            const result = await this.downloadTransactions(address, offset, this.downloadFullSize + 10, useNode);
            console.log(`Processing full download(offset = ${offset}, size = ${this.downloadFullSize}) for: ${address}`);
            //const t = this.processItems(result.transactions);
            //console.log('permit amount ' + t);
            if (!result.transactions || result.transactions.length === 0 || offset > 100000) {
                await this.setDownloadStatus(address, 'true', db);
                console.log(this.busyCounter);
                return;
            }
            await this.dataService.addData(address, result.transactions, db);
            //await this.dataService.compressInputs();
            if (this.dataService.getMaxDownloadDateDifference() >
                new Date().getTime() -
                    new Date(result.transactions[result.transactions.length - 1].timestamp).getTime()) {
                await this.downloadAllForAddress(address, offset + this.downloadFullSize, db, useNode);
            }
            else {
                await this.setDownloadStatus(address, 'true', db);
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            this.decreaseBusyCounter(address);
            this.dataService.purgeData(db);
            console.log(this.busyCounter);
        }
    }
    // Get Download Status for Address from IndexedDB
    async getDownloadStatus(address, db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([rs_DownloadStatusStoreName], 'readonly');
            const objectStore = transaction.objectStore(rs_DownloadStatusStoreName);
            const request = objectStore.get(address + '_' + this.dataService.getDataType());
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }
    // Set Download Status for Address in IndexedDB
    async setDownloadStatus(address, status, db) {
        let dbStatus = await this.getDownloadStatus(address, db);
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
        await this.saveDownloadStatus(dbStatus, db);
    }
    async saveDownloadStatus(downloadStatus, db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([rs_DownloadStatusStoreName], 'readwrite');
            const objectStore = transaction.objectStore(rs_DownloadStatusStoreName);
            const request = objectStore.put(downloadStatus);
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }
    async downloadForAddress(address, useNode) {
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
            await this.dataService.addData(address, result.transactions, this.db);
            const downloadStatus = (await this.getDownloadStatus(address, this.db))?.status || 'false';
            if (existingData && downloadStatus === 'true') {
                console.log(`Found existing boxId in db for ${address}, no need to download more.`);
            }
            else if (itemsz >= this.downloadInitialSize) {
                await this.setDownloadStatus(address, 'false', this.db);
                console.log(`Downloading all tx's for : ${address}`);
                await this.downloadAllForAddress(address, 0, this.db, useNode);
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
}
