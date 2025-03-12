interface EventPayload<T> {
  type: string;
  data?: T;
  profile: string | undefined;
}

interface EventSender {
  sendEvent<T>(event: EventPayload<T>): Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ServiceWorkerEventSender implements EventSender {
  async sendEvent<T>(event: EventPayload<T>): Promise<void> {
    const clientsList = await (self as unknown as ServiceWorkerGlobalScope).clients.matchAll({
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
  constructor(private eventSender: EventSender) {}
  private async initServices(profile: string | undefined) {
    const db: IDBDatabase = await this.initIndexedDB(profile);
    const chartService: ChartService = new ChartService();
    const rewardDataService: RewardDataService = new RewardDataService(
      db,
      chartService,
      this.eventSender,
    );
    const chainPerformanceDataService: ChainPerformanceDataService =
      new ChainPerformanceDataService(db, this.eventSender);
    const downloadService: DownloadService<DbInput> = new DownloadService<DbInput>(
      rs_FullDownloadsBatchSize,
      rs_InitialNDownloads,
      rewardDataService,
      this.eventSender,
      db,
    );
    const downloadPerfService: DownloadService<PerfTx> = new DownloadService<PerfTx>(
      rs_PerfFullDownloadsBatchSize,
      rs_PerfInitialNDownloads,
      chainPerformanceDataService,
      this.eventSender,
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

  public async processEvent(event: EventPayload<object>) {
    if (
      event.type === 'StatisticsScreenLoaded' ||
      event.type === 'PerformanceScreenLoaded' ||
      event.type === 'RequestInputsDownload'
    ) {
      const profile = event.data as string | undefined;

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
      } = await this.initServices(profile);

      if (event.type === 'RequestInputsDownload') {
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
      } else if (event.type === 'StatisticsScreenLoaded') {
        console.log(
          'Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain',
        );

        try {
          const inputs = await dataService.getSortedInputs();
          this.eventSender.sendEvent({
            type: 'InputsChanged',
            profile: profile,
            data: inputs,
          });

          await downloadService.downloadForAddresses(profile);
        } catch (error) {
          console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
      } else if (event.type === 'PerformanceScreenLoaded') {
        console.log('Rosen service worker received PerformanceScreenLoaded');

        try {
          const addressCharts = await chartService.getAddressCharts(
            await dataService.getSortedInputs(),
          );

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
        } catch (error) {
          console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
      }
    }
  }

  // IndexedDB Initialization
  private async initIndexedDB(profile: string | undefined): Promise<IDBDatabase> {
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
}
