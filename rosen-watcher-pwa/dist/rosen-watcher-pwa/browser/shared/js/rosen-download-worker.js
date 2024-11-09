// No triple-slash directives or 'declare const self'
var dataService;
var downloadService;
var chartService;
async function initializeServices() {
    if (!chartService) {
        chartService = new ChartService();
    }
    if (!dataService) {
        const db = await initIndexedDB();
        dataService = new DataService(db, chartService);
    }
    if (!downloadService) {
        downloadService = new DownloadService(dataService);
    }
}
// Service Worker Event Listener
self.addEventListener('message', async (event) => {
    const data = event.data;
    console.log(`Rosen service worker received event of type ${data.type}`);
    initializeServices();
    if (data && data.type === 'StatisticsScreenLoaded') {
        console.log('Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain');
        try {
            const inputs = await dataService.getSortedInputs();
            const amountsByDate = chartService.getAmountsByDate(inputs, data.data);
            console.log(amountsByDate);
            sendMessageToClients({ type: 'InputsChanged', data: inputs });
            await downloadService.downloadForAddresses();
        }
        catch (error) {
            console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
    }
    else if (data && data.type === 'PerformanceScreenLoaded') {
        console.log('Rosen service worker received PerformanceScreenLoaded');
        try {
            const addressCharts = await chartService.getAddressCharts(await dataService.getSortedInputs());
            sendMessageToClients({ type: 'AddressChartChanged', data: addressCharts });
        }
        catch (error) {
            console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
    }
});
// IndexedDB Initialization
async function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(rs_DbName, rs_DbVersion);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (db.objectStoreNames.contains(rs_InputsStoreName)) {
                db.deleteObjectStore(rs_InputsStoreName);
            }
            db.createObjectStore(rs_InputsStoreName, { keyPath: rs_Input_Key });
            if (!db.objectStoreNames.contains(rs_AddressDataStoreName)) {
                db.createObjectStore(rs_AddressDataStoreName, { keyPath: rs_Address_Key });
            }
            // Create the new store for download status
            if (!db.objectStoreNames.contains(rs_DownloadStatusStoreName)) {
                db.createObjectStore(rs_DownloadStatusStoreName, { keyPath: rs_Address_Key });
            }
        };
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
