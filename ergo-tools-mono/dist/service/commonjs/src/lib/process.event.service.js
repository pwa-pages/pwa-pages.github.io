"use strict";
async function createServices(eventSender, db) {
    const chartService = new ChartService();
    const rewardDataService = new RewardDataService(db, chartService, eventSender);
    const permitsDataService = new PermitsDataService(db);
    const watcherDataService = new WatcherDataService(permitsDataService);
    const chainPerformanceDataService = new ChainPerformanceDataService(db, eventSender);
    const downloadStatusIndexedDbRewardDataService = new DownloadStatusIndexedDbService(rewardDataService, db);
    const downloadStatusIndexedDbWatcherDataService = new DownloadStatusIndexedDbService(watcherDataService, db);
    const downloadStatusIndexedDbPermitsDataService = new DownloadStatusIndexedDbService(permitsDataService, db);
    const downloadStatusIndexedDbChainPerformanceDataService = new DownloadStatusIndexedDbService(chainPerformanceDataService, db);
    const downloadService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, rewardDataService, eventSender, downloadStatusIndexedDbRewardDataService);
    const downloadMyWatchersService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, watcherDataService, eventSender, downloadStatusIndexedDbWatcherDataService);
    const downloadActivePermitsService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, permitsDataService, eventSender, downloadStatusIndexedDbPermitsDataService);
    const downloadPerfService = new DownloadService(rs_PerfFullDownloadsBatchSize, rs_PerfInitialNDownloads, chainPerformanceDataService, eventSender, downloadStatusIndexedDbChainPerformanceDataService);
    return {
        dataService: rewardDataService,
        chainPerformanceDataService,
        watcherDataService,
        downloadService,
        chartService,
        downloadPerfService,
        downloadMyWatchersService,
        downloadActivePermitsService,
        permitsDataService,
    };
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
    constructor(eventSender) {
        this.eventSender = eventSender;
    }
    async processEvent(event) {
        if (event.type === 'StatisticsScreenLoaded' ||
            event.type === 'PerformanceScreenLoaded' ||
            event.type === 'MyWatchersScreenLoaded' ||
            event.type === 'RequestInputsDownload') {
            const db = await this.initIndexedDB();
            const services = await createServices(this.eventSender, db);
            if (event.type === 'RequestInputsDownload') {
                await this.processRequestInputsDownload(event, services);
            }
            else if (event.type === 'StatisticsScreenLoaded') {
                await this.processStatisticsScreenLoaded(services);
            }
            else if (event.type === 'MyWatchersScreenLoaded') {
                await this.processMyWatchersScreenLoaded(event, services);
            }
            else if (event.type === 'PerformanceScreenLoaded') {
                await this.processPerformanceScreenLoaded(services);
            }
        }
    }
    async processPerformanceScreenLoaded(services) {
        console.log('Rosen service worker received PerformanceScreenLoaded');
        try {
            console.log('Downloading perftxs.');
            const perfTxs = await services.chainPerformanceDataService.getPerfTxs();
            this.eventSender?.sendEvent({
                type: 'PerfChartChanged',
                data: perfTxs,
            });
            services.downloadPerfService.downloadForAddress(hotWalletAddress, true);
        }
        catch (error) {
            console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
    }
    async processMyWatchersScreenLoaded(event, services) {
        const addresses = event.data
            .addresses;
        console.log('Rosen service worker received MyWatchersScreenLoaded initiating syncing of data by downloading from blockchain');
        try {
            let permits = await services.watcherDataService.getAdressPermits(addresses);
            let chainTypes = this.extractChaintTypes(permits, addresses);
            this.sendPermitsChangedEvent(permits);
            if (chainTypes.size === 0) {
                await this.downloadForChainPermitAddresses(addresses, services);
                permits = await this.sendPermitChangedEvent(services, addresses);
                let chainTypes = this.extractChaintTypes(permits, addresses);
                await this.processActivePermits(chainTypes, services, addresses);
            }
            else {
                await this.processActivePermits(chainTypes, services, addresses);
                await this.downloadForChainPermitAddresses(addresses, services);
                await this.sendPermitChangedEvent(services, addresses);
                let newChainTypes = this.extractChaintTypes(await services.watcherDataService.getAdressPermits(addresses), addresses);
                if (newChainTypes.size !== chainTypes.size ||
                    [...newChainTypes].some((ct) => !chainTypes.has(ct))) {
                    await this.processActivePermits(newChainTypes, services, addresses);
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
    async processActivePermits(chainTypes, services, addresses) {
        await Promise.all(Array.from(chainTypes).map(async (chainType) => {
            await services.permitsDataService.downloadOpenBoxes(chainType);
        }));
        await this.sendPermitChangedEvent(services, addresses);
        await Promise.all(Array.from(chainTypes).map(async (chainType) => {
            await this.downloadForActivePermitAddresses(addresses, chainType, services);
        }));
    }
    async downloadForChainPermitAddresses(addresses, services) {
        try {
            const downloadPromises = Object.entries(permitAddresses)
                .filter(([, address]) => address != null)
                .map(async ([chainType, address]) => {
                await services.downloadMyWatchersService.downloadForAddress(address, true);
                const permits = await services.watcherDataService.getAdressPermits(addresses);
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
    async sendPermitChangedEvent(services, addresses) {
        let permits = await services.watcherDataService.getAdressPermits(addresses);
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
    async processStatisticsScreenLoaded(services) {
        console.log('Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain');
        try {
            const inputs = await services.dataService.getSortedInputs();
            this.eventSender?.sendEvent({
                type: 'InputsChanged',
                data: inputs,
            });
            await services.downloadService.downloadForAddresses();
        }
        catch (error) {
            console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
    }
    async downloadForActivePermitAddresses(allAddresses, chainType, services) {
        try {
            let addresses = [];
            Object.entries(permitTriggerAddresses).forEach(([key, address]) => {
                if (key === chainType && address != null) {
                    addresses.push(address);
                }
            });
            const downloadPromises = addresses.map(async (address) => {
                await services.downloadActivePermitsService.downloadForAddress(address, true, async () => {
                    try {
                        const permits = await services.watcherDataService.getAdressPermits(allAddresses);
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
    async processRequestInputsDownload(event, services) {
        console.log('Rosen service worker received RequestInputsDownload initiating syncing of data by downloading from blockchain, event.data: ' +
            event.data);
        try {
            const addressCharts = await services.chartService.getAddressCharts(await services.dataService.getSortedInputs());
            this.eventSender?.sendEvent({
                type: 'AddressChartChanged',
                data: addressCharts,
            });
            if (event.data && typeof event.data === 'string') {
                await services.downloadService.downloadForAddress(event.data, true);
            }
            else {
                await services.downloadService.downloadForAddresses();
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
