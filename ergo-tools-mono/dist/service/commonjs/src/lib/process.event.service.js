"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProcessEventService = exports.ProcessEventService = exports.ServiceWorkerEventSender = void 0;
const chain_performance_data_service_1 = require("./chain.performance.data.service");
const chain_service_1 = require("./chain.service");
const chart_service_1 = require("./chart.service");
const constants_1 = require("./constants");
const download_service_1 = require("./download.service");
const download_status_indexeddb_service_1 = require("./download.status.indexeddb.service");
const permits_data_service_1 = require("./permits.data.service");
const reports_data_service_1 = require("./reports.data.service");
const reward_data_service_1 = require("./reward.data.service");
const watcher_data_service_1 = require("./watcher.data.service");
async function createServices(eventSender, db) {
    const chartService = new chart_service_1.ChartService();
    const rewardDataService = new reward_data_service_1.RewardDataService(db, chartService, eventSender);
    const permitsDataService = new permits_data_service_1.PermitsDataService(db);
    const reportsDataService = new reports_data_service_1.ReportsDataService(db, eventSender);
    const watcherDataService = new watcher_data_service_1.WatcherDataService(permitsDataService);
    const chainPerformanceDataService = new chain_performance_data_service_1.ChainPerformanceDataService(db, eventSender);
    const downloadStatusIndexedDbRewardDataService = new download_status_indexeddb_service_1.DownloadStatusIndexedDbService(rewardDataService, db);
    const downloadStatusIndexedDbWatcherDataService = new download_status_indexeddb_service_1.DownloadStatusIndexedDbService(watcherDataService, db);
    const downloadStatusIndexedDbPermitsDataService = new download_status_indexeddb_service_1.DownloadStatusIndexedDbService(permitsDataService, db);
    const downloadStatusIndexedDbChainPerformanceDataService = new download_status_indexeddb_service_1.DownloadStatusIndexedDbService(chainPerformanceDataService, db);
    const downloadService = new download_service_1.DownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, rewardDataService, eventSender, downloadStatusIndexedDbRewardDataService);
    const downloadMyWatchersService = new download_service_1.DownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, watcherDataService, eventSender, downloadStatusIndexedDbWatcherDataService);
    const downloadActivePermitsService = new download_service_1.DownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, permitsDataService, eventSender, downloadStatusIndexedDbPermitsDataService);
    const downloadReportsService = new download_service_1.DownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, reportsDataService, eventSender, downloadStatusIndexedDbPermitsDataService);
    const downloadPerfService = new download_service_1.DownloadService(constants_1.rs_PerfFullDownloadsBatchSize, constants_1.rs_PerfInitialNDownloads, chainPerformanceDataService, eventSender, downloadStatusIndexedDbChainPerformanceDataService);
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
        reportsDataService,
        downloadReportsService,
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
exports.ServiceWorkerEventSender = ServiceWorkerEventSender;
class ProcessEventService {
    eventSender;
    constructor(eventSender) {
        this.eventSender = eventSender;
    }
    async processEvent(event) {
        try {
            if (event.type === 'StatisticsScreenLoaded' ||
                event.type === 'PerformanceScreenLoaded' ||
                event.type === 'MyWatchersScreenLoaded' ||
                event.type === 'RequestInputsDownload' ||
                event.type === 'ReportsRequested') {
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
                    case 'ReportsRequested':
                        await this.processReportsRequested(event, services);
                        break;
                }
            }
        }
        catch (error) {
            console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
    }
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            let dbName = constants_1.rs_DbName;
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
    async processReportsRequested(event, services) {
        console.log('Rosen service worker received ReportsRequested initiating syncing of data by downloading from blockchain, event.data: ' +
            event.data);
        if (event.data && typeof event.data === 'string') {
            var chainType = event.data;
            for (const [addressChainType, address] of Object.entries(chain_service_1.permitTriggerAddresses)) {
                if (addressChainType === chainType && address != null) {
                    var performances = await services.reportsDataService.getWatcherPerformanceByChainType();
                    await this.eventSender?.sendEvent({
                        type: 'ReportsChanged',
                        data: performances,
                    });
                    await services.downloadReportsService.downloadForAddress(address, constants_1.UrlAction.PermitTriggerTransactions);
                    performances = await services.reportsDataService.getWatcherPerformanceByChainType();
                    await this.eventSender?.sendEvent({
                        type: 'ReportsChanged',
                        data: performances,
                    });
                }
            }
        }
    }
    async processRequestInputsDownload(event, services) {
        console.log('Rosen service worker received RequestInputsDownload initiating syncing of data by downloading from blockchain, event.data: ' +
            event.data);
        const addressCharts = await services.chartService.getAddressCharts(await services.dataService.getSortedInputs());
        await this.eventSender?.sendEvent({
            type: 'AddressChartChanged',
            data: addressCharts,
        });
        if (event.data && typeof event.data === 'string') {
            await services.downloadService.downloadForAddress(event.data, constants_1.UrlAction.StatisticsTransactions);
        }
        else {
            await services.downloadService.downloadForAddresses(constants_1.UrlAction.StatisticsTransactions);
        }
    }
    async processStatisticsScreenLoaded(services) {
        console.log('Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain');
        const inputs = await services.dataService.getSortedInputs();
        await this.eventSender?.sendEvent({
            type: 'InputsChanged',
            data: inputs,
        });
        await services.downloadService.downloadForAddresses(constants_1.UrlAction.StatisticsTransactions);
    }
    async processPerformanceScreenLoaded(services) {
        console.log('Rosen service worker received PerformanceScreenLoaded');
        console.log('Downloading perftxs.');
        const perfTxs = await services.chainPerformanceDataService.getPerfTxs();
        await this.eventSender?.sendEvent({
            type: 'PerfChartChanged',
            data: perfTxs,
        });
        await services.downloadPerfService.downloadForAddress(chain_service_1.hotWalletAddress, constants_1.UrlAction.StatisticsTransactions);
    }
    async processMyWatchersScreenLoaded(event, services) {
        const { addresses } = event.data;
        console.log('Rosen service worker received MyWatchersScreenLoaded initiating syncing of data by downloading from blockchain');
        const permits = await services.watcherDataService.getAdressPermits(addresses);
        const chainTypes = this.extractChainTypes(permits, addresses);
        await this.sendPermitsChangedEvent(permits);
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
        const permitAddressEntries = Object.entries(chain_service_1.permitAddresses).filter(([, address]) => address != null);
        await Promise.all(permitAddressEntries.map(([chainType, address]) => this.downloadForChainPermitAddress(addresses, chainType, address, services)));
    }
    async downloadForChainPermitAddress(addresses, chainType, address, services) {
        await services.downloadMyWatchersService.downloadForAddress(address, constants_1.UrlAction.PermitTransactions);
        const permits = await services.watcherDataService.getAdressPermits(addresses);
        await this.eventSender?.sendEvent({
            type: 'PermitsChanged',
            data: permits,
        });
        await this.eventSender?.sendEvent({
            type: 'AddressPermitsDownloaded',
            data: chainType,
        });
    }
    async sendPermitChangedEvent(services, addresses) {
        const permits = await services.watcherDataService.getAdressPermits(addresses);
        await this.eventSender?.sendEvent({
            type: 'PermitsChanged',
            data: permits,
        });
        return permits;
    }
    async sendPermitsChangedEvent(permits) {
        await this.eventSender?.sendEvent({
            type: 'PermitsChanged',
            data: permits,
        });
    }
    async downloadForActivePermitAddresses(allAddresses, chainType, services) {
        const addresses = [];
        for (const [addressChainType, address] of Object.entries(chain_service_1.permitTriggerAddresses)) {
            if (addressChainType === chainType && address != null) {
                addresses.push(address);
            }
        }
        await Promise.all(addresses.map((address) => this.downloadForActivePermitAddress(allAddresses, address, services)));
    }
    async downloadForActivePermitAddress(allAddresses, address, services) {
        await services.downloadActivePermitsService.downloadForAddress(address, constants_1.UrlAction.PermitTriggerTransactions, () => this.sendPermitsChangedEventForAddresses(services, allAddresses));
    }
    async sendPermitsChangedEventForAddresses(services, addresses) {
        const permits = await services.watcherDataService.getAdressPermits(addresses);
        await this.eventSender?.sendEvent({
            type: 'PermitsChanged',
            data: permits,
        });
    }
}
exports.ProcessEventService = ProcessEventService;
const CreateProcessEventService = (eventSender) => {
    return new ProcessEventService(eventSender);
};
exports.CreateProcessEventService = CreateProcessEventService;
