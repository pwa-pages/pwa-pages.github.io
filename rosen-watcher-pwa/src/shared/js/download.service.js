// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DownloadService {
    dataService;
    eventSender;
    db;
    busyCounter = 0;
    downloadFullSize = rs_FullDownloadsBatchSize;
    downloadInitialSize = rs_InitialNDownloads;
    constructor(downloadFullSize, downloadInitialSize, dataService, eventSender, db) {
        this.dataService = dataService;
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
    async downloadTransactions(address, offset = 0, limit = 500, profile) {
        const url = `https://api.ergoplatform.com/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;
        console.log(`Downloading from: ${url}`);
        this.eventSender.sendEvent({
            type: 'StartDownload',
            profile: profile,
        });
        const response = await this.fetchTransactions(url);
        const result = {
            transactions: response.items,
            total: response.total,
            items: [],
        };
        for (const item of response.items) {
            const inputDate = new Date(item.timestamp);
            if (inputDate < rs_StartFrom) {
                this.eventSender.sendEvent({
                    type: 'EndDownload',
                    profile: profile,
                });
                return result;
            }
        }
        this.eventSender.sendEvent({
            type: 'EndDownload',
            profile: profile,
        });
        return result;
    }
    async downloadForAddresses(profile) {
        try {
            const addresses = await this.dataService.getData(rs_AddressDataStoreName);
            const downloadPromises = addresses.map(async (addressObj) => {
                await this.downloadForAddress(addressObj.address, profile);
            });
            await Promise.all(downloadPromises);
        }
        catch (e) {
            console.error('Error downloading for addresses:', e);
        }
    }
    // Busy Counter
    increaseBusyCounter(profile) {
        if (this.busyCounter === 0) {
            this.eventSender.sendEvent({
                type: 'StartFullDownload',
                profile: profile,
            });
        }
        this.busyCounter++;
    }
    decreaseBusyCounter(profile) {
        this.busyCounter--;
        if (this.busyCounter === 0) {
            this.eventSender.sendEvent({
                type: 'EndFullDownload',
                profile: profile,
            });
        }
    }
    // Download All for Address (recursive)
    async downloadAllForAddress(address, offset, db, profile) {
        this.increaseBusyCounter(profile);
        console.log(this.busyCounter);
        try {
            const result = await this.downloadTransactions(address, offset, this.downloadFullSize + 10, profile);
            console.log(`Processing full download(offset = ${offset}, size = ${this.downloadFullSize}) for: ${address}`);
            //const t = this.processItems(result.transactions);
            //console.log('permit amount ' + t);
            if (!result.transactions || result.transactions.length === 0 || offset > 100000) {
                await this.setDownloadStatus(address, 'true', db);
                console.log(this.busyCounter);
                return;
            }
            await this.dataService.addData(address, result.transactions, db, profile);
            //await this.dataService.compressInputs();
            if (this.dataService.getMaxDownloadDateDifference() >
                new Date().getTime() -
                    new Date(result.transactions[result.transactions.length - 1].timestamp).getTime()) {
                await this.downloadAllForAddress(address, offset + this.downloadFullSize, db, profile);
            }
            else {
                await this.setDownloadStatus(address, 'true', db);
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            this.decreaseBusyCounter(profile);
            console.log(this.busyCounter);
        }
    }
    /*
    processItems(items: TransactionItem[]): number {
      let r = 0;
      items.forEach((item) => {
        
        item.inputs.forEach((i) => {
          i.assets.forEach((a) => {
            if (a.name == 'rspv2CardanoRWT') {
              r -= a.amount;
            }
          });
        });
        
  
        item.outputs.forEach((o) => {
          if (!getChainType(o.address)) {
            o.assets.forEach((a) => {
              if (a.name == 'rspv2CardanoRWT') {
                r += a.amount;
                if (a.amount > 30000000) {
                  console.log('wtfffffffffffffff ' + a.amount);
                }
              }
            });
          }
        });
      });
  
      return r / 3000000;
    }
    */
    // Get Download Status for Address from IndexedDB
    async getDownloadStatus(address, db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([rs_DownloadStatusStoreName], 'readonly');
            const objectStore = transaction.objectStore(rs_DownloadStatusStoreName);
            const request = objectStore.get(address + '_' + this.dataService.getDataType());
            request.onsuccess = () => resolve(request.result?.status || 'false');
            request.onerror = (event) => reject(event.target.error);
        });
    }
    // Set Download Status for Address in IndexedDB
    async setDownloadStatus(address, status, db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([rs_DownloadStatusStoreName], 'readwrite');
            const objectStore = transaction.objectStore(rs_DownloadStatusStoreName);
            address = address + '_' + this.dataService.getDataType();
            const Address = address;
            const request = objectStore.put({ Address, address, status });
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }
    async downloadForAddress(address, profile) {
        this.increaseBusyCounter(profile);
        console.log(this.busyCounter);
        try {
            const result = await this.downloadTransactions(address, 0, this.downloadInitialSize, profile);
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
            await this.dataService.addData(address, result.transactions, this.db, profile);
            const downloadStatus = await this.getDownloadStatus(address, this.db);
            if (existingData && downloadStatus === 'true') {
                console.log(`Found existing boxId in db for ${address}, no need to download more.`);
            }
            else if (itemsz >= this.downloadInitialSize) {
                await this.setDownloadStatus(address, 'false', this.db);
                console.log(`Downloading all tx's for : ${address}`);
                await this.downloadAllForAddress(address, 0, this.db, profile);
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            this.decreaseBusyCounter(profile);
            console.log(this.busyCounter);
        }
    }
}
