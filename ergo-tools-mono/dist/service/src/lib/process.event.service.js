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
    constructor(eventSender) {
        this.eventSender = eventSender;
    }
    async processEvent(event) {
        try {
            if (event.type === 'StatisticsScreenLoaded' ||
                event.type === 'PerformanceScreenLoaded' ||
                event.type === 'MyWatchersScreenLoaded' ||
                event.type === 'RequestInputsDownload') {
                const db = await this.initIndexedDB();
                const services = await createServices(this.eventSender, db);
                switch (event.type) {
                    case 'RequestInputsDownload':
                        await this.processRequestInputsDownload(event, services);
                        break;
                    case 'StatisticsScreenLoaded':
                        await this.processStatisticsScreenLoaded(services);
                        break;
                    case 'MyWatchersScreenLoaded':
                        await this.processMyWatchersScreenLoaded(event, services);
                        break;
                    case 'PerformanceScreenLoaded':
                        await this.processPerformanceScreenLoaded(services);
                        break;
                }
            }
        }
        catch (error) {
            console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
    }
    async processPerformanceScreenLoaded(services) {
        console.log('Rosen service worker received PerformanceScreenLoaded');
        console.log('Downloading perftxs.');
        const perfTxs = await services.chainPerformanceDataService.getPerfTxs();
        this.eventSender?.sendEvent({
            type: 'PerfChartChanged',
            data: perfTxs,
        });
        services.downloadPerfService.downloadForAddress(hotWalletAddress, true);
    }
    async processMyWatchersScreenLoaded(event, services) {
        const { addresses } = event.data;
        console.log('Rosen service worker received MyWatchersScreenLoaded initiating syncing of data by downloading from blockchain');
        const permits = await services.watcherDataService.getAdressPermits(addresses);
        const chainTypes = this.extractChainTypes(permits, addresses);
        this.sendPermitsChangedEvent(permits);
        if (chainTypes.size === 0) {
            await this.downloadForChainPermitAddresses(addresses, services);
            const updatedPermits = await this.sendPermitChangedEvent(services, addresses);
            const updatedChainTypes = this.extractChainTypes(updatedPermits, addresses);
            await this.processActivePermits(updatedChainTypes, services, addresses);
            return;
        }
        await this.processActivePermits(chainTypes, services, addresses);
        await this.downloadForChainPermitAddresses(addresses, services);
        await this.sendPermitChangedEvent(services, addresses);
        const updatedPermits = await services.watcherDataService.getAdressPermits(addresses);
        const updatedChainTypes = this.extractChainTypes(updatedPermits, addresses);
        const chainTypesChanged = updatedChainTypes.size !== chainTypes.size ||
            [...updatedChainTypes].some((chainType) => !chainTypes.has(chainType));
        if (chainTypesChanged) {
            await this.processActivePermits(updatedChainTypes, services, addresses);
        }
    }
    extractChainTypes(permits, addresses) {
        const chainTypes = new Set();
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
    async sendPermitChangedEvent(services, addresses) {
        const permits = await services.watcherDataService.getAdressPermits(addresses);
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
        const inputs = await services.dataService.getSortedInputs();
        this.eventSender?.sendEvent({
            type: 'InputsChanged',
            data: inputs,
        });
        await services.downloadService.downloadForAddresses();
    }
    async downloadForActivePermitAddresses(allAddresses, chainType, services) {
        let addresses = [];
        Object.entries(permitTriggerAddresses).forEach(([key, address]) => {
            if (key === chainType && address != null) {
                addresses.push(address);
            }
        });
        const downloadPromises = addresses.map(async (address) => {
            await services.downloadActivePermitsService.downloadForAddress(address, true, async () => {
                const permits = await services.watcherDataService.getAdressPermits(allAddresses);
                await this.eventSender?.sendEvent({
                    type: 'PermitsChanged',
                    data: permits,
                });
            });
        });
        await Promise.all(downloadPromises);
    }
    async processRequestInputsDownload(event, services) {
        console.log('Rosen service worker received RequestInputsDownload initiating syncing of data by downloading from blockchain, event.data: ' +
            event.data);
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
//# sourceMappingURL=process.event.service.js.map