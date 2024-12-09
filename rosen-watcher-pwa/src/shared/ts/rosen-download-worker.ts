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

  if (data.type === 'StatisticsScreenLoaded' || data.type === 'PerformanceScreenLoaded') {
    const profile = data.data as string | undefined;

    const db: IDBDatabase = await initIndexedDB(profile);
    const chartService: ChartService = new ChartService();
    const dataService: DataService = new DataService(db, chartService);
    const downloadService: DownloadService = new DownloadService(dataService);

    if (data && data.type === 'StatisticsScreenLoaded') {
      console.log(
        'Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain',
      );

      try {
        const inputs = await dataService.getSortedInputs();
        sendMessageToClients({ type: 'InputsChanged', data: inputs, profile: profile });

        await downloadService.downloadForAddresses(profile);
        //await dataService.compressInputs();
      } catch (error) {
        console.error('Error initializing IndexedDB or downloading addresses:', error);
      }
    } else if (data && data.type === 'PerformanceScreenLoaded') {
      console.log('Rosen service worker received PerformanceScreenLoaded');

      try {
        const addressCharts = await chartService.getAddressCharts(
          await dataService.getSortedInputs(),
        );

        sendMessageToClients({
          type: 'AddressChartChanged',
          data: addressCharts,
          profile: profile,
        });
      } catch (error) {
        console.error('Error initializing IndexedDB or downloading addresses:', error);
      }
    }
  }
});

// IndexedDB Initialization
async function initIndexedDB(profile: string | undefined): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    console.log('Loading service worker db with profile: ' + profile);

    let dbName = rs_DbName;

    if (profile) {
      dbName = dbName + '_' + profile;
    }

    const request: IDBOpenDBRequest = indexedDB.open(dbName);

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
async function sendMessageToClients<T>(message: {
  type: string;
  data?: T;
  profile: string | undefined;
}): Promise<void> {
  const clientsList = await (self as unknown as ServiceWorkerGlobalScope).clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });
  for (const client of clientsList) {
    client.postMessage(message);
  }
}
