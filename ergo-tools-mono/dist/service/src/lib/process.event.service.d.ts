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
}
declare function createServices(eventSender: EventSender, db: IDBDatabase): Promise<Services>;
declare class ServiceWorkerEventSender implements EventSender {
    sendEvent<T>(event: EventPayload<T>): Promise<void>;
}
declare class ProcessEventService {
    private eventSender;
    constructor(eventSender: EventSender);
    processEvent(event: EventPayload<object>): Promise<void>;
    private processPerformanceScreenLoaded;
    private processMyWatchersScreenLoaded;
    private extractChaintTypes;
    private processActivePermits;
    downloadForChainPermitAddresses(addresses: string[], services: Services): Promise<void>;
    private sendPermitChangedEvent;
    private sendPermitsChangedEvent;
    private processStatisticsScreenLoaded;
    downloadForActivePermitAddresses(allAddresses: string[], chainType: string, services: Services): Promise<void>;
    private processRequestInputsDownload;
    private initIndexedDB;
}
