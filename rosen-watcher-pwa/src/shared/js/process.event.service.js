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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ProcessEventService {
    eventSender;
    constructor(eventSender) {
        this.eventSender = eventSender;
    }
    async initServices(profile) {
        const db = await this.initIndexedDB(profile);
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
            const profile = event.data;
            const { dataService, downloadService, downloadPerfService, chartService, chainPerformanceDataService, } = await this.initServices(profile);
            if (event.type === 'RequestInputsDownload') {
                console.log('Rosen service worker received RequestInputsDownload initiating syncing of data by downloading from blockchain');
                try {
                    const inputs = await dataService.getSortedInputs();
                    this.eventSender.sendEvent({
                        type: 'InputsChanged',
                        profile: profile,
                        data: inputs,
                    });
                    await downloadService.downloadForAddresses(profile);
                    //await dataService.compressInputs();
                    //({ dataService, downloadService, chartService } = await initServices(profile));
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
                        profile: profile,
                        data: inputs,
                    });
                    await downloadService.downloadForAddresses(profile);
                }
                catch (error) {
                    console.error('Error initializing IndexedDB or downloading addresses:', error);
                }
            }
            else if (event.type === 'PerformanceScreenLoaded') {
                console.log('Rosen service worker received PerformanceScreenLoaded');
                try {
                    const addressCharts = await chartService.getAddressCharts(await dataService.getSortedInputs());
                    this.eventSender.sendEvent({
                        type: 'AddressChartChanged',
                        profile: profile,
                        data: addressCharts,
                    });
                    console.log('Downloading perftxs.');
                    const perfTxs = await chainPerformanceDataService.getPerfTxs();
                    this.eventSender.sendEvent({
                        type: 'PerfChartChanged',
                        profile: profile,
                        data: perfTxs,
                    });
                    downloadPerfService.downloadForAddress(hotWalletAddress, undefined);
                }
                catch (error) {
                    console.error('Error initializing IndexedDB or downloading addresses:', error);
                }
            }
        }
    }
    // IndexedDB Initialization
    async initIndexedDB(profile) {
        return new Promise((resolve, reject) => {
            console.log('Loading service worker db with profile: ' + profile);
            let dbName = rs_DbName;
            if (profile) {
                dbName = dbName + '_' + profile;
            }
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
