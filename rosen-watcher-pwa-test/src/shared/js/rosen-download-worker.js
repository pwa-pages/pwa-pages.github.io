// No triple-slash directives or 'declare const self'
// Service Worker Event Listener
self.addEventListener('message', async (event) => {
    const data = event.data;
    console.log(`Rosen service worker received event of type ${data.type}`);
    if (data.type === 'StatisticsScreenLoaded' ||
        data.type === 'PerformanceScreenLoaded' ||
        data.type === 'RequestInputsDownload') {
        const profile = data.data;
        const { dataService, downloadService, downloadPerfService, chartService, chainPerformanceDataService, } = await initServices(profile);
        if (data && data.type === 'RequestInputsDownload') {
            console.log('Rosen service worker received RequestInputsDownload initiating syncing of data by downloading from blockchain');
            try {
                await downloadService.downloadForAddresses(profile);
                //await dataService.compressInputs();
                //({ dataService, downloadService, chartService } = await initServices(profile));
            }
            catch (error) {
                console.error('Error initializing IndexedDB or downloading addresses:', error);
            }
        }
        else if (data && data.type === 'StatisticsScreenLoaded') {
            console.log('Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain');
            try {
                const inputs = await dataService.getSortedInputs();
                sendMessageToClients({ type: 'InputsChanged', data: inputs, profile: profile });
                await downloadService.downloadForAddresses(profile);
            }
            catch (error) {
                console.error('Error initializing IndexedDB or downloading addresses:', error);
            }
        }
        else if (data && data.type === 'PerformanceScreenLoaded') {
            console.log('Rosen service worker received PerformanceScreenLoaded');
            try {
                const addressCharts = await chartService.getAddressCharts(await dataService.getSortedInputs());
                sendMessageToClients({
                    type: 'AddressChartChanged',
                    data: addressCharts,
                    profile: profile,
                });
                console.log('Downloading perftxs.');
                const perfTxs = await chainPerformanceDataService.getPerfTxs();
                sendMessageToClients({
                    type: 'PerfChartChanged',
                    data: perfTxs,
                    profile: profile,
                });
                downloadPerfService.downloadForAddress(hotWalletAddress, undefined);
            }
            catch (error) {
                console.error('Error initializing IndexedDB or downloading addresses:', error);
            }
        }
    }
});
async function initServices(profile) {
    const db = await initIndexedDB(profile);
    const chartService = new ChartService();
    const rewardDataService = new RewardDataService(db, chartService);
    const chainPerformanceDataService = new ChainPerformanceDataService(db);
    const downloadService = new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, rewardDataService, db);
    const downloadPerfService = new DownloadService(rs_PerfFullDownloadsBatchSize, rs_PerfInitialNDownloads, chainPerformanceDataService, db);
    return {
        dataService: rewardDataService,
        chainPerformanceDataService: chainPerformanceDataService,
        downloadService,
        chartService,
        downloadPerfService: downloadPerfService,
    };
}
// IndexedDB Initialization
async function initIndexedDB(profile) {
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
// Send messages to clients (active pages)
async function sendMessageToClients(message) {
    const clientsList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
    });
    for (const client of clientsList) {
        client.postMessage(message);
    }
}
