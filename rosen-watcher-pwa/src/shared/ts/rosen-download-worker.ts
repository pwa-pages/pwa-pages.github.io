// No triple-slash directives or 'declare const self'

// Define interfaces for the data structures used
interface MessageEventData {
  type: string;
  data: string;
}

// Service Worker Event Listener
self.addEventListener('message', async (event: MessageEvent) => {
  const data: MessageEventData = event.data;

  console.log(`Rosen service worker received event of type ${data.type}`);

  const db: IDBDatabase = await initIndexedDB();
  const chartService: ChartService = new ChartService();
  const dataService: DataService = new DataService(db, chartService);
  const downloadService: DownloadService = new DownloadService(dataService);

  if (data && data.type === 'StatisticsScreenLoaded') {
    console.log(
      'Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain',
    );

    try {
      const inputs = await dataService.getSortedInputs();
      const amountsByDate = chartService.getAmountsByDate(inputs, data.data as Period);
      console.log(amountsByDate);
      sendMessageToClients({ type: 'InputsChanged', data: inputs });

      await downloadService.downloadForAddresses();
    } catch (error) {
      console.error('Error initializing IndexedDB or downloading addresses:', error);
    }
  } else if (data && data.type === 'PerformanceScreenLoaded') {
    console.log('Rosen service worker received PerformanceScreenLoaded');

    try {
      const addressCharts = await chartService.getAddressCharts(
        await dataService.getSortedInputs(),
      );

      sendMessageToClients({ type: 'AddressChartChanged', data: addressCharts });
    } catch (error) {
      console.error('Error initializing IndexedDB or downloading addresses:', error);
    }
  }
});

// IndexedDB Initialization
async function initIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(rs_DbName, rs_DbVersion);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;

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

    request.onsuccess = (event: Event) => {
      const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event: Event) => {
      console.error('Error opening IndexedDB:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Send messages to clients (active pages)
async function sendMessageToClients<T>(message: { type: string; data?: T }): Promise<void> {
  const clientsList = await (self as unknown as ServiceWorkerGlobalScope).clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });
  for (const client of clientsList) {
    client.postMessage(message);
  }
}
