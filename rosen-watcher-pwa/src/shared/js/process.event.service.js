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
    async initServices() {
        const db = await this.initIndexedDB();
        const chartService = new ChartService();
        const rewardDataService = new RewardDataService(db, chartService, this.eventSender);
        const chainPerformanceDataService = new ChainPerformanceDataService(db, this.eventSender);
        const downloadService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, rewardDataService, this.eventSender, db);
        const downloadPerfService = new DownloadService(rs_PerfFullDownloadsBatchSize, rs_PerfInitialNDownloads, chainPerformanceDataService, this.eventSender, db);
        return {
            dataService: rewardDataService,
            chainPerformanceDataService: chainPerformanceDataService,
            downloadService,
            chartService,
            downloadPerfService: downloadPerfService,
        };
    }
    async processEvent(event) {
        if (event.type === 'StatisticsScreenLoaded' ||
            event.type === 'PerformanceScreenLoaded' ||
            event.type === 'RequestInputsDownload') {
            const { dataService, downloadService, downloadPerfService, chartService, chainPerformanceDataService, } = await this.initServices();
            if (event.type === 'RequestInputsDownload') {
                console.log('Rosen service worker received RequestInputsDownload initiating syncing of data by downloading from blockchain, event.data: ' +
                    event.data);
                try {
                    const addressCharts = await chartService.getAddressCharts(await dataService.getSortedInputs());
                    this.eventSender.sendEvent({
                        type: 'AddressChartChanged',
                        data: addressCharts,
                    });
                    await downloadService.downloadForAddresses();
                }
                catch (error) {
                    console.error('Error initializing IndexedDB or downloading addresses:', error);
                }
            }
            else if (event.type === 'StatisticsScreenLoaded') {
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
            else if (event.type === 'PerformanceScreenLoaded') {
                console.log('Rosen service worker received PerformanceScreenLoaded');
                try {
                    console.log('Downloading perftxs.');
                    const perfTxs = await chainPerformanceDataService.getPerfTxs();
                    this.eventSender.sendEvent({
                        type: 'PerfChartChanged',
                        data: perfTxs,
                    });
                    downloadPerfService.downloadForAddress(hotWalletAddress);
                }
                catch (error) {
                    console.error('Error initializing IndexedDB or downloading addresses:', error);
                }
            }
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
