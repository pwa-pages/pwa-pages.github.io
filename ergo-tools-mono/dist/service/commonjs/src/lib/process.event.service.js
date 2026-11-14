"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProcessEventService = exports.ProcessEventService = exports.ServiceWorkerEventSender = void 0;
const chain_service_1 = require("./chain.service");
const constants_1 = require("./constants");
const models_1 = require("./models");
const service_factory_1 = require("./service.factory");
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
            if (event.type === models_1.EventType.StatisticsScreenLoaded ||
                event.type === models_1.EventType.PerformanceScreenLoaded ||
                event.type === models_1.EventType.MyWatchersScreenLoaded ||
                event.type === models_1.EventType.RequestInputsDownload ||
                event.type === models_1.EventType.ReportsRequested ||
                event.type === models_1.EventType.WatchersScreenLoaded) {
                const db = await this.initIndexedDB();
                const services = await (0, service_factory_1.createServices)(this.eventSender, db);
                switch (event.type) {
                    case models_1.EventType.RequestInputsDownload:
                        await this.processRequestInputsDownload(event, services);
                        break;
                    case models_1.EventType.StatisticsScreenLoaded:
                        await this.processStatisticsScreenLoaded(services);
                        break;
                    case models_1.EventType.MyWatchersScreenLoaded:
                        await this.processMyWatchersScreenLoaded(event, services);
                        break;
                    case models_1.EventType.PerformanceScreenLoaded:
                        await this.processPerformanceScreenLoaded(services);
                        break;
                    case models_1.EventType.ReportsRequested:
                        await this.processReportsRequested(event, services);
                        break;
                    case models_1.EventType.WatchersScreenLoaded:
                        await this.processWatchersScreenLoaded(services);
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
    async processWatchersScreenLoaded(services) {
        console.log('Rosen service worker received WatchersScreenLoaded initiating syncing of data by downloading from blockchain');
        await services.watchersDataService.download();
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
                        type: models_1.EventType.ReportsChanged,
                        data: performances,
                    });
                    await services.downloadReportsService.downloadForAddress(address, constants_1.UrlAction.PermitTriggerTransactions);
                    performances = await services.reportsDataService.getWatcherPerformanceByChainType();
                    await this.eventSender?.sendEvent({
                        type: models_1.EventType.ReportsChanged,
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
            type: models_1.EventType.AddressChartChanged,
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
            type: models_1.EventType.InputsChanged,
            data: inputs,
        });
        await services.downloadService.downloadForAddresses(constants_1.UrlAction.StatisticsTransactions);
    }
    async processPerformanceScreenLoaded(services) {
        console.log('Rosen service worker received PerformanceScreenLoaded');
        console.log('Downloading perftxs.');
        const perfTxs = await services.chainPerformanceDataService.getPerfTxs();
        await this.eventSender?.sendEvent({
            type: models_1.EventType.PerfChartChanged,
            data: perfTxs,
        });
        await services.downloadPerfService.downloadForAddress(chain_service_1.hotWalletAddress, constants_1.UrlAction.StatisticsTransactions);
    }
    async processMyWatchersScreenLoaded(event, services) {
        const { addresses } = event.data;
        console.log('Rosen service worker received MyWatchersScreenLoaded initiating syncing of data by downloading from blockchain');
        const permits = await services.myWatcherDataService.getAdressPermits(addresses);
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
        const updatedPermits = await services.myWatcherDataService.getAdressPermits(addresses);
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
        const permits = await services.myWatcherDataService.getAdressPermits(addresses);
        await this.eventSender?.sendEvent({
            type: models_1.EventType.PermitsChanged,
            data: permits,
        });
        await this.eventSender?.sendEvent({
            type: models_1.EventType.AddressPermitsDownloaded,
            data: chainType,
        });
    }
    async sendPermitChangedEvent(services, addresses) {
        const permits = await services.myWatcherDataService.getAdressPermits(addresses);
        await this.eventSender?.sendEvent({
            type: models_1.EventType.PermitsChanged,
            data: permits,
        });
        return permits;
    }
    async sendPermitsChangedEvent(permits) {
        await this.eventSender?.sendEvent({
            type: models_1.EventType.PermitsChanged,
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
        const permits = await services.myWatcherDataService.getAdressPermits(addresses);
        await this.eventSender?.sendEvent({
            type: models_1.EventType.PermitsChanged,
            data: permits,
        });
    }
}
exports.ProcessEventService = ProcessEventService;
const CreateProcessEventService = (eventSender) => {
    return new ProcessEventService(eventSender);
};
exports.CreateProcessEventService = CreateProcessEventService;
