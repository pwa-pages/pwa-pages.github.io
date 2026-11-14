import { permitTriggerAddresses, hotWalletAddress, ChainType, permitAddresses } from "./chain.service";
import { rs_DbName, UrlAction } from "./constants";
import { PermitInfo, EventType } from "./models";
import { createServices, EventPayload, EventSender, Services } from "./service.factory";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class ServiceWorkerEventSender implements EventSender {
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

export class ProcessEventService {
  constructor(private eventSender: EventSender) { }

  public async processEvent(event: EventPayload<object>) {
    try {
      if (
        event.type === EventType.StatisticsScreenLoaded ||
        event.type === EventType.PerformanceScreenLoaded ||
        event.type === EventType.MyWatchersScreenLoaded ||
        event.type === EventType.RequestInputsDownload ||
        event.type === EventType.ReportsRequested ||
        event.type === EventType.WatchersScreenLoaded
      ) {
        const db = await this.initIndexedDB();
        const services = await createServices(this.eventSender, db);

        switch (event.type) {
          case EventType.RequestInputsDownload:
            await this.processRequestInputsDownload(event, services);
            break;
          case EventType.StatisticsScreenLoaded:
            await this.processStatisticsScreenLoaded(services);
            break;
          case EventType.MyWatchersScreenLoaded:
            await this.processMyWatchersScreenLoaded(event, services);
            break;
          case EventType.PerformanceScreenLoaded:
            await this.processPerformanceScreenLoaded(services);
            break;
          case EventType.ReportsRequested:
            await this.processReportsRequested(event, services);
            break;
          case EventType.WatchersScreenLoaded:
            await this.processWatchersScreenLoaded(services);
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

  private async processWatchersScreenLoaded(services: Services) {
    console.log(
      'Rosen service worker received WatchersScreenLoaded initiating syncing of data by downloading from blockchain',
    );

    await services.watchersDataService.download();
  }

  private async processReportsRequested(
    event: EventPayload<object>,
    services: Services,
  ) {
    console.log(
      'Rosen service worker received ReportsRequested initiating syncing of data by downloading from blockchain, event.data: ' +
      event.data,
    );

    if (event.data && typeof event.data === 'string') {
      var chainType = event.data as unknown as string;
      for (const [addressChainType, address] of Object.entries(
        permitTriggerAddresses,
      )) {
        if (addressChainType === chainType && address != null) {

          var performances = await services.reportsDataService.getWatcherPerformanceByChainType();

          await this.eventSender?.sendEvent({
            type: EventType.ReportsChanged,
            data: performances,
          });

          await services.downloadReportsService.downloadForAddress(
            address,
            UrlAction.PermitTriggerTransactions,
          );
          performances = await services.reportsDataService.getWatcherPerformanceByChainType();

          await this.eventSender?.sendEvent({
            type: EventType.ReportsChanged,
            data: performances,
          });
        }
      }
    }
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

    await this.eventSender?.sendEvent({
      type: EventType.AddressChartChanged,
      data: addressCharts,
    });

    if (event.data && typeof event.data === 'string') {
      await services.downloadService.downloadForAddress(
        event.data as unknown as string,
        UrlAction.StatisticsTransactions,
      );
    } else {
      await services.downloadService.downloadForAddresses(UrlAction.StatisticsTransactions);
    }
  }

  private async processStatisticsScreenLoaded(services: Services) {
    console.log(
      'Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain',
    );

    const inputs = await services.dataService.getSortedInputs();
    await this.eventSender?.sendEvent({
      type: EventType.InputsChanged,
      data: inputs,
    });

    await services.downloadService.downloadForAddresses(UrlAction.StatisticsTransactions);
  }

  private async processPerformanceScreenLoaded(
    services: Services,
  ) {
    console.log('Rosen service worker received PerformanceScreenLoaded');

    console.log('Downloading perftxs.');
    const perfTxs = await services.chainPerformanceDataService.getPerfTxs();

    await this.eventSender?.sendEvent({
      type: EventType.PerfChartChanged,
      data: perfTxs,
    });

    await services.downloadPerfService.downloadForAddress(hotWalletAddress, UrlAction.StatisticsTransactions);
  }

  private async processMyWatchersScreenLoaded(
    event: EventPayload<object>,
    services: Services,
  ) {
    const { addresses } = event.data as { addresses: string[] };
    console.log(
      'Rosen service worker received MyWatchersScreenLoaded initiating syncing of data by downloading from blockchain',
    );

    const permits = await services.myWatcherDataService.getAdressPermits(addresses);
    const chainTypes = this.extractChainTypes(permits, addresses);
    await this.sendPermitsChangedEvent(permits);

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
      await services.myWatcherDataService.getAdressPermits(addresses);
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
    await services.downloadMyWatchersService.downloadForAddress(address, UrlAction.PermitTransactions);

    const permits = await services.myWatcherDataService.getAdressPermits(addresses);

    await this.eventSender?.sendEvent({
      type: EventType.PermitsChanged,
      data: permits,
    });

    await this.eventSender?.sendEvent({
      type: EventType.AddressPermitsDownloaded,
      data: chainType,
    });
  }


  private async sendPermitChangedEvent(
    services: Services,
    addresses: string[],
  ) {
    const permits = await services.myWatcherDataService.getAdressPermits(addresses);

    await this.eventSender?.sendEvent({
      type: EventType.PermitsChanged,
      data: permits,
    });
    return permits;
  }

  private async sendPermitsChangedEvent(permits: PermitInfo[]) {
    await this.eventSender?.sendEvent({
      type: EventType.PermitsChanged,
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
      UrlAction.PermitTriggerTransactions,
      () => this.sendPermitsChangedEventForAddresses(services, allAddresses),
    );
  }

  private async sendPermitsChangedEventForAddresses(
    services: Services,
    addresses: string[],
  ): Promise<void> {
    const permits = await services.myWatcherDataService.getAdressPermits(addresses);
    await this.eventSender?.sendEvent({
      type: EventType.PermitsChanged,
      data: permits,
    });
  }
}

export const CreateProcessEventService = (
  eventSender: EventSender,
): ProcessEventService => {
  return new ProcessEventService(eventSender);
}
export { EventSender };

