"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionDownloadService = void 0;
const constants_1 = require("./constants");
const models_1 = require("./models");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TransactionDownloadService {
    //private static addressDownloadDateMap = new Map<string, Date>();
    constructor(downloadFullSize, downloadInitialSize, dataService, eventSender, downloadStatusIndexedDbService) {
        this.dataService = dataService;
        this.eventSender = eventSender;
        this.downloadStatusIndexedDbService = downloadStatusIndexedDbService;
        this.busyCounter = 0;
        this.downloadFullSize = constants_1.rs_FullDownloadsBatchSize;
        this.downloadInitialSize = constants_1.rs_InitialNDownloads;
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
    async downloadTransactions(address, offset = 0, limit = 500, urlAction) {
        var a = new models_1.Address(address, null);
        if ((0, constants_1.getUrlConfig)(urlAction).isNode) {
            const url = `${(0, constants_1.getUrlConfig)(urlAction).url}/blockchain/transaction/byAddress?offset=${offset}&limit=${limit}`;
            console.log(`Downloading for address: ${a.largeAddressForDisplay}, offset: ${offset}, size: ${limit}`);
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
                if (inputDate < constants_1.rs_StartFrom) {
                    return result;
                }
            }
            console.log('done');
            return result;
        }
        else {
            const url = `https://${(0, constants_1.getUrlConfig)(urlAction).url}/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;
            console.log(`Downloading for address: ${a.largeAddressForDisplay}, offset: ${offset}, size: ${limit}`);
            const response = await this.fetchTransactions(url);
            const result = {
                transactions: response.items,
                total: response.total,
                items: [],
            };
            for (const item of response.items) {
                const inputDate = new Date(item.timestamp);
                if (inputDate < constants_1.rs_StartFrom) {
                    return result;
                }
            }
            console.log('done');
            return result;
        }
    }
    async downloadForAddresses(urlAction) {
        console.log('Start downloading for all addresses');
        try {
            const addresses = await this.dataService.storageService.getData(constants_1.rs_AddressDataStoreName);
            const downloadPromises = addresses.map(async (addressObj) => {
                await this.downloadForAddress(addressObj.address, urlAction);
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
                type: models_1.EventType.StartFullDownload,
                data: address,
            });
        }
        this.busyCounter++;
    }
    decreaseBusyCounter(address) {
        this.busyCounter--;
        if (this.busyCounter === 0) {
            this.eventSender?.sendEvent({
                type: models_1.EventType.EndFullDownload,
                data: address,
            });
        }
    }
    // Download All for Address (recursive)
    async downloadAllForAddress(address, offset, urlAction, callback) {
        this.increaseBusyCounter(address);
        try {
            const result = await this.downloadTransactions(address, offset, this.downloadFullSize + 10, urlAction);
            if (!result.transactions ||
                result.transactions.length === 0 ||
                offset > 100000) {
                await this.downloadStatusIndexedDbService?.setDownloadStatus(address, 'true');
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
                await this.downloadAllForAddress(address, offset + this.downloadFullSize, urlAction);
            }
            else {
                await this.downloadStatusIndexedDbService?.setDownloadStatus(address, 'true');
            }
        }
        catch (e) {
            throw e;
        }
        finally {
            this.decreaseBusyCounter(address);
        }
    }
    async downloadForAddress(address, urlAction, callback) {
        this.increaseBusyCounter(address);
        try {
            const result = await this.downloadTransactions(address, 0, this.downloadInitialSize, urlAction);
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
                var a = new models_1.Address(address, null);
                console.log(`Downloading all tx's for : ${a.largeAddressForDisplay}`);
                await this.downloadAllForAddress(address, 0, urlAction, callback);
                return this.dataService.getData();
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            this.decreaseBusyCounter(address);
            this.dataService.purgeData();
        }
        return null;
    }
}
exports.TransactionDownloadService = TransactionDownloadService;
if (typeof window !== 'undefined') {
    window.DownloadService = TransactionDownloadService;
}
//# sourceMappingURL=transaction.download.service.js.map