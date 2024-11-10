// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DownloadService {
    dataService;
    busyCounter = 0;
    constructor(dataService) {
        this.dataService = dataService;
    }
    // Fetch Transactions
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
    // Download Transactions
    async downloadTransactions(address, offset = 0, limit = 500) {
        const url = `https://api.ergoplatform.com/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;
        console.log(`Downloading from: ${url}`);
        sendMessageToClients({ type: 'StartDownload' });
        const response = await this.fetchTransactions(url);
        const result = {
            transactions: response.items,
            total: response.total,
            items: [],
        };
        for (const item of response.items) {
            const inputDate = new Date(item.timestamp);
            if (inputDate < rs_StartFrom) {
                sendMessageToClients({ type: 'EndDownload' });
                return result;
            }
        }
        sendMessageToClients({ type: 'EndDownload' });
        return result;
    }
    async downloadForAddresses() {
        try {
            const addresses = await this.dataService.getData(rs_AddressDataStoreName, this.dataService.db);
            const downloadPromises = addresses.map(async (addressObj) => {
                await this.downloadForAddress(addressObj.address, this.dataService.db);
            });
            await Promise.all(downloadPromises);
        }
        catch (e) {
            console.error('Error downloading for addresses:', e);
        }
    }
    // Busy Counter
    increaseBusyCounter() {
        if (this.busyCounter === 0) {
            sendMessageToClients({ type: 'StartFullDownload' });
        }
        this.busyCounter++;
    }
    decreaseBusyCounter() {
        this.busyCounter--;
        if (this.busyCounter === 0) {
            sendMessageToClients({ type: 'EndFullDownload' });
        }
    }
    // Download All for Address (recursive)
    async downloadAllForAddress(address, offset, db) {
        this.increaseBusyCounter();
        console.log(this.busyCounter);
        try {
            const result = await this.downloadTransactions(address, offset, rs_FullDownloadsBatchSize + 10);
            console.log(`Processing full download(offset = ${offset}, size = ${rs_FullDownloadsBatchSize}) for: ${address}`);
            if (!result.transactions || result.transactions.length === 0 || offset > 100000) {
                await this.dataService.setDownloadStatus(address, 'true', db);
                console.log(this.busyCounter);
                return;
            }
            await this.dataService.addData(address, result.transactions, db);
            await this.downloadAllForAddress(address, offset + rs_FullDownloadsBatchSize, db);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            this.decreaseBusyCounter();
            console.log(this.busyCounter);
        }
    }
    async downloadForAddress(address, db) {
        this.increaseBusyCounter();
        console.log(this.busyCounter);
        try {
            const result = await this.downloadTransactions(address, 0, rs_InitialNDownloads);
            console.log(`Processing initial download(size = ${rs_InitialNDownloads}) for: ${address}`);
            const itemsz = result.transactions.length;
            let halfBoxId = '';
            if (itemsz > rs_InitialNDownloads / 2) {
                for (let i = Math.floor(itemsz / 2); i < itemsz; i++) {
                    const item = result.transactions[i];
                    for (const input of item.inputs) {
                        if (input.boxId &&
                            halfBoxId === '' &&
                            (input.assets.find((a) => a.name == 'eRSN') ||
                                input.assets.find((a) => a.name == 'RSN'))) {
                            halfBoxId = input.boxId;
                        }
                    }
                }
            }
            const boxData = await this.dataService.getDataByBoxId(halfBoxId, address, db);
            console.log('Add bunch of data');
            await this.dataService.addData(address, result.transactions, db);
            const downloadStatus = await this.dataService.getDownloadStatus(address, db);
            if (boxData && downloadStatus === 'true') {
                console.log(`Found existing boxId in db for ${address}, no need to download more.`);
            }
            else if (itemsz >= rs_InitialNDownloads) {
                await this.dataService.setDownloadStatus(address, 'false', db);
                console.log(`Downloading all tx's for : ${address}`);
                await this.downloadAllForAddress(address, 0, db);
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            this.decreaseBusyCounter();
            console.log(this.busyCounter);
        }
    }
}
