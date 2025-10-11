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
        const myWatcherDataService = new MyWatcherDataService(db, activepermitsDataService);
        const chainPerformanceDataService = new ChainPerformanceDataService(db, this.eventSender);
        const downloadService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, rewardDataService, myWatcherDataService, this.eventSender, db);
        const downloadMyWatchersService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, myWatcherDataService, myWatcherDataService, this.eventSender, db);
        const downloadActivePermitsService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, activepermitsDataService, myWatcherDataService, this.eventSender, db);
        const downloadPerfService = new DownloadService(rs_PerfFullDownloadsBatchSize, rs_PerfInitialNDownloads, chainPerformanceDataService, myWatcherDataService, this.eventSender, db);
        this.services = {
            dataService: rewardDataService,
            chainPerformanceDataService: chainPerformanceDataService,
            myWatcherDataService: myWatcherDataService,
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
            const { dataService, downloadService, downloadPerfService, downloadMyWatchersService, downloadActivePermitsService, chartService, chainPerformanceDataService, myWatcherDataService, activePermitsDataService, } = await this.initServices();
            if (event.type === 'RequestInputsDownload') {
                await this.processRequestInputsDownload(event, chartService, dataService, downloadService);
            }
            else if (event.type === 'StatisticsScreenLoaded') {
                await this.processStatisticsScreenLoaded(dataService, downloadService);
            }
            else if (event.type === 'MyWatchersScreenLoaded') {
                await this.processMyWatchersScreenLoaded(event, myWatcherDataService, downloadMyWatchersService, activePermitsDataService, downloadActivePermitsService);
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
            this.eventSender.sendEvent({
                type: 'PerfChartChanged',
                data: perfTxs,
            });
            downloadPerfService.downloadForAddress(hotWalletAddress, true);
        }
        catch (error) {
            console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
    }
    async processMyWatchersScreenLoaded(event, myWatcherDataService, downloadMyWatchersService, activePermitsDataService, downloadActivePermitsService) {
        const addresses = event.data.addresses;
        console.log('Rosen service worker received MyWatchersScreenLoaded initiating syncing of data by downloading from blockchain');
        try {
            let permits = await myWatcherDataService.getAdressPermits(addresses);
            let chainTypes = this.extractChaintTypes(permits, addresses);
            this.sendPermitsChangedEvent(permits);
            if (chainTypes.size === 0) {
                await downloadMyWatchersService.downloadForChainPermitAddresses(addresses);
                permits = await this.sendPermitChangedEvent(myWatcherDataService, addresses);
                let chainTypes = this.extractChaintTypes(permits, addresses);
                await this.processActivePermits(chainTypes, activePermitsDataService, myWatcherDataService, addresses, downloadActivePermitsService);
            }
            else {
                await this.processActivePermits(chainTypes, activePermitsDataService, myWatcherDataService, addresses, downloadActivePermitsService);
                await downloadMyWatchersService.downloadForChainPermitAddresses(addresses);
                await this.sendPermitChangedEvent(myWatcherDataService, addresses);
                let newChainTypes = this.extractChaintTypes(await myWatcherDataService.getAdressPermits(addresses), addresses);
                if (newChainTypes.size !== chainTypes.size ||
                    [...newChainTypes].some((ct) => !chainTypes.has(ct))) {
                    await this.processActivePermits(newChainTypes, activePermitsDataService, myWatcherDataService, addresses, downloadActivePermitsService);
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
    async processActivePermits(chainTypes, activePermitsDataService, myWatcherDataService, addresses, downloadActivePermitsService) {
        await Promise.all(Array.from(chainTypes).map(async (chainType) => {
            await activePermitsDataService.downloadOpenBoxes(chainType);
        }));
        await this.sendPermitChangedEvent(myWatcherDataService, addresses);
        await Promise.all(Array.from(chainTypes).map(async (chainType) => {
            await downloadActivePermitsService.downloadForActivePermitAddresses(addresses, chainType);
            await this.sendPermitChangedEvent(myWatcherDataService, addresses);
        }));
    }
    async sendPermitChangedEvent(myWatcherDataService, addresses) {
        let permits = await myWatcherDataService.getAdressPermits(addresses);
        this.eventSender.sendEvent({
            type: 'PermitsChanged',
            data: permits,
        });
        return permits;
    }
    sendPermitsChangedEvent(permits) {
        this.eventSender.sendEvent({
            type: 'PermitsChanged',
            data: permits,
        });
    }
    async processStatisticsScreenLoaded(dataService, downloadService) {
        console.log('Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain');
        try {
            const inputs = await dataService.getSortedInputs();
            this.eventSender.sendEvent({
                type: 'InputsChanged',
                data: inputs,
            });
            await downloadService.downloadForAddresses();
        }
        catch (error) {
            console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
    }
    async processRequestInputsDownload(event, chartService, dataService, downloadService) {
        console.log('Rosen service worker received RequestInputsDownload initiating syncing of data by downloading from blockchain, event.data: ' +
            event.data);
        try {
            const addressCharts = await chartService.getAddressCharts(await dataService.getSortedInputs());
            this.eventSender.sendEvent({
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
}
