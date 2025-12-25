"use strict";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DownloadService {
    //private static addressDownloadDateMap = new Map<string, Date>();
    constructor(downloadFullSize, downloadInitialSize, dataService, eventSender, downloadStatusIndexedDbService) {
        this.dataService = dataService;
        this.eventSender = eventSender;
        this.downloadStatusIndexedDbService = downloadStatusIndexedDbService;
        this.busyCounter = 0;
        this.downloadFullSize = rs_FullDownloadsBatchSize;
        this.downloadInitialSize = rs_InitialNDownloads;
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
    }
}
if (typeof window !== 'undefined') {
    window.DownloadService = DownloadService;
    globalThis.CreateActivePermitsDownloadService = (eventSender, storageService) => {
        const activepermitsDataService = new ActivePermitsDataService(storageService);
        return new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, activepermitsDataService, eventSender, null);
    };
}
//# sourceMappingURL=download.service.js.map