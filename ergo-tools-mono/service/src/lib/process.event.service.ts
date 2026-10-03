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
  watcherDataService: WatcherDataService;
  permitsDataService: PermitsDataService;
  downloadService: DownloadService<DbInput>;
  chartService: ChartService;
  downloadPerfService: DownloadService<PerfTx>;
  downloadMyWatchersService: DownloadService<PermitTx>;
  downloadActivePermitsService: DownloadService<PermitTx>;
  reportsDataService: ReportsDataService;
  downloadReportsService: DownloadService<PermitTx>;
}

async function createServices(
  eventSender: EventSender,
  db: IDBDatabase,
): Promise<Services> {
  const chartService: ChartService = new ChartService();
  const rewardDataService: RewardDataService = new RewardDataService(
    db,
    chartService,
    eventSender,
  );

  const permitsDataService: PermitsDataService =
    new PermitsDataService(db);
  const reportsDataService: ReportsDataService =
    new ReportsDataService(db);
  const watcherDataService: WatcherDataService = new WatcherDataService(
    permitsDataService,
  );

  const chainPerformanceDataService: ChainPerformanceDataService =
    new ChainPerformanceDataService(db, eventSender);

  const downloadStatusIndexedDbRewardDataService =
    new DownloadStatusIndexedDbService<DbInput>(rewardDataService, db);
  const downloadStatusIndexedDbWatcherDataService =
    new DownloadStatusIndexedDbService<PermitTx>(watcherDataService, db);
  const downloadStatusIndexedDbPermitsDataService =
    new DownloadStatusIndexedDbService<PermitTx>(permitsDataService, db);
  const downloadStatusIndexedDbChainPerformanceDataService =
    new DownloadStatusIndexedDbService<PerfTx>(chainPerformanceDataService, db);

  const downloadService: DownloadService<DbInput> =
    new DownloadService<DbInput>(
      rs_FullDownloadsBatchSize,
      rs_InitialNDownloads,
      rewardDataService,
      eventSender,
      downloadStatusIndexedDbRewardDataService,
    );
  const downloadMyWatchersService: DownloadService<PermitTx> =
    new DownloadService<PermitTx>(
      rs_FullDownloadsBatchSize,
      rs_InitialNDownloads,
      watcherDataService,
      eventSender,
      downloadStatusIndexedDbWatcherDataService,
    );
  const downloadActivePermitsService: DownloadService<PermitTx> =
    new DownloadService<PermitTx>(
      rs_FullDownloadsBatchSize,
      rs_InitialNDownloads,
      permitsDataService,
      eventSender,
      downloadStatusIndexedDbPermitsDataService,
    );
    const downloadReportsService: DownloadService<PermitTx> =
    new DownloadService<PermitTx>(
      rs_FullDownloadsBatchSize,
      rs_InitialNDownloads,
      reportsDataService,
      eventSender,
      downloadStatusIndexedDbPermitsDataService,
    );
  const downloadPerfService: DownloadService<PerfTx> =
    new DownloadService<PerfTx>(
      rs_PerfFullDownloadsBatchSize,
      rs_PerfInitialNDownloads,
      chainPerformanceDataService,
      eventSender,
      downloadStatusIndexedDbChainPerformanceDataService,
    );

  return {
    dataService: rewardDataService,
    chainPerformanceDataService,
    watcherDataService,
    downloadService,
    chartService,
    downloadPerfService,
    downloadMyWatchersService,
    downloadActivePermitsService,
    permitsDataService,
    reportsDataService,
    downloadReportsService,
  };
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
  constructor(private eventSender: EventSender) { }

  public async processEvent(event: EventPayload<object>) {
    try {
      if (
        event.type === 'StatisticsScreenLoaded' ||
        event.type === 'PerformanceScreenLoaded' ||
        event.type === 'MyWatchersScreenLoaded' ||
        event.type === 'RequestInputsDownload' ||
        event.type === 'ReportsRequested'
      ) {
        const db = await this.initIndexedDB();
        const services = await createServices(this.eventSender, db);

        switch (event.type) {
          case 'RequestInputsDownload':
            await this.processRequestInputsDownload(event, services);
            break;
          case 'StatisticsScreenLoaded':
            await this.processStatisticsScreenLoaded(services);
            break;
          case 'MyWatchersScreenLoaded':
            await this.processMyWatchersScreenLoaded(event, services);
            break;
          case 'PerformanceScreenLoaded':
            await this.processPerformanceScreenLoaded(services);
            break;
          case 'ReportsRequested':
            await this.processReportsRequested(event, services);
            break;
        }
      }
    } catch (error) {
      console.error(
        'Error initializing IndexedDB or downloading addresses:',
        error,
      );
    }
  }

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

  private async processReportsRequested(
    event: EventPayload<object>,
    services: Services,
  ) {
    console.log(
      'Rosen service worker received ReportsRequested initiating syncing of data by downloading from blockchain, event.data: ' +
        event.data,
    );

    await services.downloadReportsService.downloadForAddress(
        event.data as unknown as string,
        true,
      );
  }

  private async processRequestInputsDownload(
    event: EventPayload<object>,
    services: Services,
  ) {
    console.log(
      'Rosen service worker received RequestInputsDownload initiating syncing of data by downloading from blockchain, event.data: ' +
        event.data,
    );

    const addressCharts = await services.chartService.getAddressCharts(
      await services.dataService.getSortedInputs(),
    );

    this.eventSender?.sendEvent({
      type: 'AddressChartChanged',
      data: addressCharts,
    });

    if (event.data && typeof event.data === 'string') {
      await services.downloadService.downloadForAddress(
        event.data as unknown as string,
        true,
      );
    } else {
      await services.downloadService.downloadForAddresses();
    }
  }

  private async processStatisticsScreenLoaded(services: Services) {
    console.log(
      'Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain',
    );

    const inputs = await services.dataService.getSortedInputs();
    this.eventSender?.sendEvent({
      type: 'InputsChanged',
      data: inputs,
    });

    await services.downloadService.downloadForAddresses();
  }

  private async processPerformanceScreenLoaded(
    services: Services,
  ) {
    console.log('Rosen service worker received PerformanceScreenLoaded');

    console.log('Downloading perftxs.');
    const perfTxs = await services.chainPerformanceDataService.getPerfTxs();

    this.eventSender?.sendEvent({
      type: 'PerfChartChanged',
      data: perfTxs,
    });

    services.downloadPerfService.downloadForAddress(hotWalletAddress, true);
  }

  private async processMyWatchersScreenLoaded(
    event: EventPayload<object>,
    services: Services,
  ) {
    const { addresses } = event.data as { addresses: string[] };
    console.log(
      'Rosen service worker received MyWatchersScreenLoaded initiating syncing of data by downloading from blockchain',
    );

    const permits = await services.watcherDataService.getAdressPermits(addresses);
    const chainTypes = this.extractChainTypes(permits, addresses);
    this.sendPermitsChangedEvent(permits);

    if (chainTypes.size === 0) {
      await this.downloadForChainPermitAddresses(addresses, services);
      const updatedPermits = await this.sendPermitChangedEvent(
        services,
        addresses,
      );
      const updatedChainTypes = this.extractChainTypes(
        updatedPermits,
        addresses,
      );
      await this.processActivePermits(
        updatedChainTypes,
        services,
        addresses,
      );
      return;
    }

    await this.processActivePermits(chainTypes, services, addresses);
    await this.downloadForChainPermitAddresses(addresses, services);
    await this.sendPermitChangedEvent(services, addresses);

    const updatedPermits =
      await services.watcherDataService.getAdressPermits(addresses);
    const updatedChainTypes = this.extractChainTypes(
      updatedPermits,
      addresses,
    );

    const chainTypesChanged =
      updatedChainTypes.size !== chainTypes.size ||
      [...updatedChainTypes].some((chainType) => !chainTypes.has(chainType));

    if (chainTypesChanged) {
      await this.processActivePermits(
        updatedChainTypes,
        services,
        addresses,
      );
    }
  }

  private extractChainTypes(permits: PermitInfo[], addresses: string[]) {
    const chainTypes = new Set<ChainType>();
    for (const permit of Object.values(permits)) {
      if (permit && permit.chainType && addresses.includes(permit.address)) {
        chainTypes.add(permit.chainType);
      }
    }
    return chainTypes;
  }

  private async processActivePermits(
    chainTypes: Set<ChainType>,
    services: Services,
    addresses: string[],
  ) {
    await Promise.all(
      Array.from(chainTypes).map(async (chainType) => {
        await services.permitsDataService.downloadOpenBoxes(chainType!);
      }),
    );

    await this.sendPermitChangedEvent(services, addresses);

    await Promise.all(
      Array.from(chainTypes).map(async (chainType) => {
        await this.downloadForActivePermitAddresses(
          addresses,
          chainType!,
          services,
        );
      }),
    );
  }

  async downloadForChainPermitAddresses(
    addresses: string[],
    services: Services,
  ): Promise<void> {
    const permitAddressEntries = Object.entries(permitAddresses).filter(
      ([, address]) => address != null,
    );

    await Promise.all(
      permitAddressEntries.map(([chainType, address]) =>
        this.downloadForChainPermitAddress(
          addresses,
          chainType,
          address as string,
          services,
        ),
      ),
    );
  }

  private async downloadForChainPermitAddress(
    addresses: string[],
    chainType: string,
    address: string,
    services: Services,
  ): Promise<void> {
    await services.downloadMyWatchersService.downloadForAddress(address, true);

    const permits = await services.watcherDataService.getAdressPermits(addresses);

    await this.eventSender?.sendEvent({
      type: 'PermitsChanged',
      data: permits,
    });

    await this.eventSender?.sendEvent({
      type: 'AddressPermitsDownloaded',
      data: chainType,
    });
  }


  private async sendPermitChangedEvent(
    services: Services,
    addresses: string[],
  ) {
    const permits = await services.watcherDataService.getAdressPermits(addresses);

    this.eventSender?.sendEvent({
      type: 'PermitsChanged',
      data: permits,
    });
    return permits;
  }

  private sendPermitsChangedEvent(permits: PermitInfo[]) {
    this.eventSender?.sendEvent({
      type: 'PermitsChanged',
      data: permits,
    });
  }

  async downloadForActivePermitAddresses(
    allAddresses: string[],
    chainType: string,
    services: Services,
  ): Promise<void> {
    const addresses: string[] = [];
    for (const [addressChainType, address] of Object.entries(
      permitTriggerAddresses,
    )) {
      if (addressChainType === chainType && address != null) {
        addresses.push(address);
      }
    }

    await Promise.all(
      addresses.map((address) =>
        this.downloadForActivePermitAddress(allAddresses, address, services),
      ),
    );
  }

  private async downloadForActivePermitAddress(
    allAddresses: string[],
    address: string,
    services: Services,
  ): Promise<void> {
    await services.downloadActivePermitsService.downloadForAddress(
      address,
      true,
      () => this.sendPermitsChangedEventForAddresses(services, allAddresses),
    );
  }

  private async sendPermitsChangedEventForAddresses(
    services: Services,
    addresses: string[],
  ): Promise<void> {
    const permits = await services.watcherDataService.getAdressPermits(addresses);
    await this.eventSender?.sendEvent({
      type: 'PermitsChanged',
      data: permits,
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
