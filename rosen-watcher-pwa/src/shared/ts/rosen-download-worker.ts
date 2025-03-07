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

  if (
    data.type === 'StatisticsScreenLoaded' ||
    data.type === 'PerformanceScreenLoaded' ||
    data.type === 'RequestInputsDownload'
  ) {
    const profile = data.data as string | undefined;

    const {
      dataService,
      downloadService,
      downloadPerfService,
      chartService,
      chainPerformanceDataService,
    }: {
      dataService: RewardDataService;
      downloadService: DownloadService<DbInput>;
      downloadPerfService: DownloadService<PerfTx>;
      chartService: ChartService;
      chainPerformanceDataService: ChainPerformanceDataService;
    } = await initServices(profile);

    if (data && data.type === 'RequestInputsDownload') {
      console.log(
        'Rosen service worker received RequestInputsDownload initiating syncing of data by downloading from blockchain',
      );

      try {
        await downloadService.downloadForAddresses(profile);

        //await dataService.compressInputs();
        //({ dataService, downloadService, chartService } = await initServices(profile));
      } catch (error) {
        console.error('Error initializing IndexedDB or downloading addresses:', error);
      }
    } else if (data && data.type === 'StatisticsScreenLoaded') {
      console.log(
        'Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain',
      );

      try {
        const inputs = await dataService.getSortedInputs();
        sendMessageToClients({ type: 'InputsChanged', data: inputs, profile: profile });

        await downloadService.downloadForAddresses(profile);
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

        console.log('Downloading perftxs.');
        const perfTxs = await chainPerformanceDataService.getPerfTxs();
        sendMessageToClients({
          type: 'PerfChartChanged',
          data: perfTxs,
          profile: profile,
        });

        downloadPerfService.downloadForAddress(hotWalletAddress, undefined);
      } catch (error) {
        console.error('Error initializing IndexedDB or downloading addresses:', error);
      }
    }
  }
});

async function initServices(profile: string | undefined) {
  const db: IDBDatabase = await initIndexedDB(profile);
  const chartService: ChartService = new ChartService();
  const rewardDataService: RewardDataService = new RewardDataService(db, chartService);
  const chainPerformanceDataService: ChainPerformanceDataService = new ChainPerformanceDataService(
    db,
  );
  const downloadService: DownloadService<DbInput> = new DownloadService<DbInput>(
    rs_FullDownloadsBatchSize,
    rs_InitialNDownloads,
    rewardDataService,
    db,
  );
  const downloadPerfService: DownloadService<PerfTx> = new DownloadService<PerfTx>(
    rs_PerfFullDownloadsBatchSize,
    rs_PerfInitialNDownloads,
    chainPerformanceDataService,
    db,
  );
  return {
    dataService: rewardDataService,
    chainPerformanceDataService: chainPerformanceDataService,
    downloadService,
    chartService,
    downloadPerfService: downloadPerfService,
  };
}

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
