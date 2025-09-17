interface EventPayload<T> {
  type: string;
  data?: T;
}

interface EventSender {
  sendEvent<T>(event: EventPayload<T>): Promise<void>;
}

interface Services {
  dataService: RewardDataService;
  chainPerformanceDataService: ChainPerformanceDataService;
  myWatcherDataService: MyWatcherDataService;
  downloadService: DownloadService<DbInput>;
  chartService: ChartService;
  downloadPerfService: DownloadService<PerfTx>;
  downloadMyWatchersService: DownloadService<PermitTx>;
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

class ProcessEventService {
  private services: Services | null = null;
  constructor(private eventSender: EventSender) {}

  private async initServices() {
    //if (this.services) return this.services;

    const db: IDBDatabase = await this.initIndexedDB();
    const chartService: ChartService = new ChartService();
    const rewardDataService: RewardDataService = new RewardDataService(
      db,
      chartService,
      this.eventSender,
    );
    const myWatcherDataService: MyWatcherDataService = new MyWatcherDataService(
      db,
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
    const downloadMyWatchersService: DownloadService<PermitTx> = new DownloadService<PermitTx>(
      rs_FullDownloadsBatchSize,
      rs_InitialNDownloads,
      myWatcherDataService,
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

    this.services = {
      dataService: rewardDataService,
      chainPerformanceDataService: chainPerformanceDataService,
      myWatcherDataService: myWatcherDataService,
      downloadService,
      chartService,
      downloadPerfService: downloadPerfService,
      downloadMyWatchersService: downloadMyWatchersService,
    } as Services;
    return this.services;
  }

  public async processEvent(event: EventPayload<object>) {
    if (
      event.type === 'StatisticsScreenLoaded' ||
      event.type === 'PerformanceScreenLoaded' ||
      event.type === 'MyWatchersScreenLoaded' ||
      event.type === 'RequestInputsDownload' ||
      event.type === 'RequestAddressPermits'
    ) {
      const {
        dataService,
        downloadService,
        downloadPerfService,
        downloadMyWatchersService,
        chartService,
        chainPerformanceDataService,
        myWatcherDataService,
      }: Services = await this.initServices();

      if (event.type === 'RequestInputsDownload') {
        console.log(
          'Rosen service worker received RequestInputsDownload initiating syncing of data by downloading from blockchain, event.data: ' +
            event.data,
        );

        try {
          const addressCharts = await chartService.getAddressCharts(
            await dataService.getSortedInputs(),
          );

          this.eventSender.sendEvent({
            type: 'AddressChartChanged',
            data: addressCharts,
          });

          if (event.data && typeof event.data === 'string') {
            await downloadService.downloadForAddress(event.data as unknown as string);
          } else {
            await downloadService.downloadForAddresses();
          }
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
            data: inputs,
          });

          await downloadService.downloadForAddresses();
        } catch (error) {
          console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
      } else if (event.type === 'MyWatchersScreenLoaded') {
        console.log(
          'Rosen service worker received MyWatchersScreenLoaded initiating syncing of data by downloading from blockchain',
        );

        try {
          const permits = await myWatcherDataService.getAdressPermits();
          this.eventSender.sendEvent({
            type: 'PermitsChanged',
            data: permits,
          });

          await downloadMyWatchersService.downloadForChainPermitAddresses();
        } catch (error) {
          console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
      } else if (event.type === 'RequestAddressPermits') {
        const chaintype: string | undefined = (event.data as { chainType?: string })?.chainType;
        console.log(
          'Rosen service worker received RequestAddressPermits for ' +
            chaintype +
            ', initiating syncing of data by downloading from blockchain',
        );
        /*
        try {
          const permits = await myWatcherDataService.getAdressPermits();
          this.eventSender.sendEvent({
            type: 'PermitsChanged',
            data: permits,
          });

          await downloadMyWatchersService.downloadForChainPermitAddresses();
        } catch (error) {
          console.error('Error initializing IndexedDB or downloading addresses:', error);
        }*/
      } else if (event.type === 'PerformanceScreenLoaded') {
        console.log('Rosen service worker received PerformanceScreenLoaded');

        try {
          console.log('Downloading perftxs.');
          const perfTxs = await chainPerformanceDataService.getPerfTxs();

          this.eventSender.sendEvent({
            type: 'PerfChartChanged',
            data: perfTxs,
          });

          downloadPerfService.downloadForAddress(hotWalletAddress);
        } catch (error) {
          console.error('Error initializing IndexedDB or downloading addresses:', error);
        }
      }
    }
  }

  // IndexedDB Initialization
  private async initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      let dbName = rs_DbName;

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

/* eslint-disable @typescript-eslint/no-explicit-any */
if (typeof window !== 'undefined') {
  (window as any).ProcessEventService = ProcessEventService;
}
