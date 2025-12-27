

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
  activePermitsDataService: ActivePermitsDataService;
  downloadService: DownloadService<DbInput>;
  chartService: ChartService;
  downloadPerfService: DownloadService<PerfTx>;
  downloadMyWatchersService: DownloadService<PermitTx>;
  downloadActivePermitsService: DownloadService<PermitTx>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ServiceWorkerEventSender implements EventSender {
  async sendEvent<T>(event: EventPayload<T>): Promise<void> {
    const clientsList = await (
      self as any
    ).clients.matchAll({
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
  constructor(private eventSender: EventSender) { }

  private async initServices() {
    //if (this.services) return this.services;

    const db: IDBDatabase = await this.initIndexedDB();
    const chartService: ChartService = new ChartService();
    const rewardDataService: RewardDataService = new RewardDataService(
      db,
      chartService,
      this.eventSender,
    );

    const activepermitsDataService: ActivePermitsDataService =
      new ActivePermitsDataService(db);
    const myWatcherDataService: MyWatcherDataService = new MyWatcherDataService(
      db,
      activepermitsDataService,
    );
    
   const chainPerformanceDataService: ChainPerformanceDataService =
      new ChainPerformanceDataService(db, this.eventSender);

    const downloadStatusIndexedDbRewardDataService: DownloadStatusIndexedDbService<DbInput>  = new DownloadStatusIndexedDbService<DbInput>(rewardDataService, db);
    const downloadStatusIndexedDbMyWatcherDataService: DownloadStatusIndexedDbService<PermitTx>  = new DownloadStatusIndexedDbService<PermitTx>(myWatcherDataService, db);
    const downloadStatusIndexedDbActivePermitsDataService: DownloadStatusIndexedDbService<PermitTx>  = new DownloadStatusIndexedDbService<PermitTx>(activepermitsDataService, db);
    const downloadStatusIndexedDbChainPerformanceDataService: DownloadStatusIndexedDbService<PerfTx>  = new DownloadStatusIndexedDbService<PerfTx>(chainPerformanceDataService, db);

    
    const downloadService: DownloadService<DbInput> =
      new DownloadService<DbInput>(
        rs_FullDownloadsBatchSize,
        rs_InitialNDownloads,
        rewardDataService,
        this.eventSender,
        downloadStatusIndexedDbRewardDataService,
      );
    const downloadMyWatchersService: DownloadService<PermitTx> =
      new DownloadService<PermitTx>(
        rs_FullDownloadsBatchSize,
        rs_InitialNDownloads,
        myWatcherDataService,
        this.eventSender,
        downloadStatusIndexedDbMyWatcherDataService,
      );
    const downloadActivePermitsService: DownloadService<PermitTx> =
      new DownloadService<PermitTx>(
        rs_FullDownloadsBatchSize,
        rs_InitialNDownloads,
        activepermitsDataService,
        this.eventSender,
        downloadStatusIndexedDbActivePermitsDataService,
      );
    const downloadPerfService: DownloadService<PerfTx> =
      new DownloadService<PerfTx>(
        rs_PerfFullDownloadsBatchSize,
        rs_PerfInitialNDownloads,
        chainPerformanceDataService,
        this.eventSender,
        downloadStatusIndexedDbChainPerformanceDataService,
      );

    this.services = {
      dataService: rewardDataService,
      chainPerformanceDataService: chainPerformanceDataService,
      myWatcherDataService: myWatcherDataService,
      downloadService,
      chartService,
      downloadPerfService: downloadPerfService,
      downloadMyWatchersService: downloadMyWatchersService,
      downloadActivePermitsService: downloadActivePermitsService,
      activePermitsDataService: activepermitsDataService,
    } as Services;
    return this.services;
  }

  public async processEvent(event: EventPayload<object>) {
    if (
      event.type === 'StatisticsScreenLoaded' ||
      event.type === 'PerformanceScreenLoaded' ||
      event.type === 'MyWatchersScreenLoaded' ||
      event.type === 'RequestInputsDownload'
    ) {
      const {
        dataService,
        downloadService,
        downloadPerfService,
        downloadMyWatchersService,
        downloadActivePermitsService,
        chartService,
        chainPerformanceDataService,
        myWatcherDataService,
        activePermitsDataService,
      }: Services = await this.initServices();

      if (event.type === 'RequestInputsDownload') {
        await this.processRequestInputsDownload(
          event,
          chartService,
          dataService,
          downloadService,
        );
      } else if (event.type === 'StatisticsScreenLoaded') {
        await this.processStatisticsScreenLoaded(dataService, downloadService);
      } else if (event.type === 'MyWatchersScreenLoaded') {
        await this.processMyWatchersScreenLoaded(
          event,
          myWatcherDataService,
          downloadMyWatchersService,
          activePermitsDataService,
          downloadActivePermitsService,
        );
      } else if (event.type === 'PerformanceScreenLoaded') {
        await this.processPerformanceScreenLoaded(
          chainPerformanceDataService,
          downloadPerfService,
        );
      }
    }
  }

  private async processPerformanceScreenLoaded(
    chainPerformanceDataService: ChainPerformanceDataService,
    downloadPerfService: DownloadService<PerfTx>,
  ) {
    console.log('Rosen service worker received PerformanceScreenLoaded');

    try {
      console.log('Downloading perftxs.');
      const perfTxs = await chainPerformanceDataService.getPerfTxs();

      this.eventSender.sendEvent({
        type: 'PerfChartChanged',
        data: perfTxs,
      });

      downloadPerfService.downloadForAddress(hotWalletAddress, true);
    } catch (error) {
      console.error(
        'Error initializing IndexedDB or downloading addresses:',
        error,
      );
    }
  }

  private async processMyWatchersScreenLoaded(
    event: EventPayload<object>,
    myWatcherDataService: MyWatcherDataService,
    downloadMyWatchersService: DownloadService<PermitTx>,
    activePermitsDataService: ActivePermitsDataService,
    downloadActivePermitsService: DownloadService<PermitTx>,
  ) {
    const addresses: string[] = (event.data as { addresses: string[] })
      .addresses;

    console.log(
      'Rosen service worker received MyWatchersScreenLoaded initiating syncing of data by downloading from blockchain',
    );

    try {
      let permits = await myWatcherDataService.getAdressPermits(addresses);
      let chainTypes = this.extractChaintTypes(permits, addresses);
      this.sendPermitsChangedEvent(permits);

      if (chainTypes.size === 0) {
        await this.downloadForChainPermitAddresses(
          addresses, downloadMyWatchersService, myWatcherDataService
        );
        permits = await this.sendPermitChangedEvent(
          myWatcherDataService,
          addresses,
        );
        let chainTypes = this.extractChaintTypes(permits, addresses);

        await this.processActivePermits(
          chainTypes,
          activePermitsDataService,
          myWatcherDataService,
          addresses,
          downloadActivePermitsService,
        );
      } else {
        await this.processActivePermits(
          chainTypes,
          activePermitsDataService,
          myWatcherDataService,
          addresses,
          downloadActivePermitsService,
        );

        await this.downloadForChainPermitAddresses(
          addresses, downloadMyWatchersService, myWatcherDataService
        );
        await this.sendPermitChangedEvent(myWatcherDataService, addresses);

        let newChainTypes = this.extractChaintTypes(
          await myWatcherDataService.getAdressPermits(addresses),
          addresses,
        );

        if (
          newChainTypes.size !== chainTypes.size ||
          [...newChainTypes].some((ct) => !chainTypes.has(ct))
        ) {
          await this.processActivePermits(
            newChainTypes,
            activePermitsDataService,
            myWatcherDataService,
            addresses,
            downloadActivePermitsService,
          );
        }
      }
    } catch (error) {
      console.error(
        'Error initializing IndexedDB or downloading addresses:',
        error,
      );
    }
  }

  private extractChaintTypes(permits: PermitInfo[], addresses: string[]) {
    let chainTypes = new Set<ChainType>();
    for (const permit of Object.values(permits)) {
      if (permit && permit.chainType && addresses.includes(permit.address)) {
        chainTypes.add(permit.chainType);
      }
    }
    return chainTypes;
  }

  private async processActivePermits(
    chainTypes: Set<ChainType>,
    activePermitsDataService: ActivePermitsDataService,
    myWatcherDataService: MyWatcherDataService,
    addresses: string[],
    downloadActivePermitsService: DownloadService<PermitTx>,
  ) {
    await Promise.all(
      Array.from(chainTypes).map(async (chainType) => {
        await activePermitsDataService.downloadOpenBoxes(chainType!);
      }),
    );

    await this.sendPermitChangedEvent(myWatcherDataService, addresses);

    await Promise.all(
      Array.from(chainTypes).map(async (chainType) => {
        await this.downloadForActivePermitAddresses(
          addresses,
          chainType!, downloadActivePermitsService, myWatcherDataService
        );
      }),
    );
  }

  async downloadForChainPermitAddresses(addresses: string[], downloadMyWatchersService: DownloadService<PermitTx>, myWatcherDataService: MyWatcherDataService): Promise<void> {
    try {
      const downloadPromises: Promise<void>[] = Object.entries(permitAddresses)
        .filter(([, address]) => address != null)
        .map(async ([chainType, address]) => {
          await downloadMyWatchersService.downloadForAddress(address as string, true);

          const permits =
            await myWatcherDataService.getAdressPermits(addresses);

          await this.eventSender.sendEvent({
            type: 'PermitsChanged',
            data: permits,
          });

          await this.eventSender.sendEvent({
            type: 'AddressPermitsDownloaded',
            data: chainType,
          });
        });

      await Promise.all(downloadPromises);
    } catch (e) {
      console.error('Error downloading for addresses:', e);
    }
  }


  private async sendPermitChangedEvent(
    myWatcherDataService: MyWatcherDataService,
    addresses: string[],
  ) {
    let permits = await myWatcherDataService.getAdressPermits(addresses);

    this.eventSender.sendEvent({
      type: 'PermitsChanged',
      data: permits,
    });
    return permits;
  }

  private sendPermitsChangedEvent(permits: PermitInfo[]) {
    this.eventSender.sendEvent({
      type: 'PermitsChanged',
      data: permits,
    });
  }

  private async processStatisticsScreenLoaded(
    dataService: RewardDataService,
    downloadService: DownloadService<DbInput>,
  ) {
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
      console.error(
        'Error initializing IndexedDB or downloading addresses:',
        error,
      );
    }
  }


  async downloadForActivePermitAddresses(
    allAddresses: string[],
    chainType: string,
    downloadActivePermitsService: DownloadService<PermitTx>,
    myWatcherDataService: MyWatcherDataService
  ): Promise<void> {
    try {
      let addresses: string[] = [];

      Object.entries(permitTriggerAddresses).forEach(([key, address]) => {
        if (key === chainType && address != null) {
          addresses.push(address);
        }
      });

      const downloadPromises: Promise<void>[] = addresses.map(
        async (address) => {
          await downloadActivePermitsService.downloadForAddress(address, true, async () => {
            try {
              const permits =
                await myWatcherDataService.getAdressPermits(allAddresses);

              await this.eventSender.sendEvent({
                type: 'PermitsChanged',
                data: permits,
              });
            } catch (err) {
              console.error('Error in permits callback:', err);
            }
          });
        },
      );

      await Promise.all(downloadPromises);
    } catch (e) {
      console.error('Error downloading for addresses:', e);
    }
  }

  private async processRequestInputsDownload(
    event: EventPayload<object>,
    chartService: ChartService,
    dataService: RewardDataService,
    downloadService: DownloadService<DbInput>,
  ) {
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
        await downloadService.downloadForAddress(
          event.data as unknown as string,
          true,
        );
      } else {
        await downloadService.downloadForAddresses();
      }
    } catch (error) {
      console.error(
        'Error initializing IndexedDB or downloading addresses:',
        error,
      );
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
        console.error(
          'Error opening IndexedDB:',
          (event.target as IDBOpenDBRequest).error,
        );
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }
}



/* eslint-disable @typescript-eslint/no-explicit-any */
if (typeof window !== 'undefined') {
  (window as any).ProcessEventService = ProcessEventService;
  (globalThis as any).CreateProcessEventService = (
    eventSender: EventSender,
  ): ProcessEventService => {
    return new ProcessEventService(eventSender);
  };
}
