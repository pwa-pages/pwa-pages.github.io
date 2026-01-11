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
    activePermitsDataService: ActivePermitsDataService;
    downloadService: DownloadService<DbInput>;
    chartService: ChartService;
    downloadPerfService: DownloadService<PerfTx>;
    downloadMyWatchersService: DownloadService<PermitTx>;
    downloadActivePermitsService: DownloadService<PermitTx>;
}
declare class ServiceWorkerEventSender implements EventSender {
    sendEvent<T>(event: EventPayload<T>): Promise<void>;
}
declare class ProcessEventService {
    private eventSender;
    private services;
    constructor(eventSender: EventSender);
    private initServices;
    processEvent(event: EventPayload<object>): Promise<void>;
    private processPerformanceScreenLoaded;
    private processMyWatchersScreenLoaded;
    private extractChaintTypes;
    private processActivePermits;
    downloadForChainPermitAddresses(addresses: string[], downloadMyWatchersService: DownloadService<PermitTx>, watcherDataService: WatcherDataService): Promise<void>;
    private sendPermitChangedEvent;
    private sendPermitsChangedEvent;
    private processStatisticsScreenLoaded;
    downloadForActivePermitAddresses(allAddresses: string[], chainType: string, downloadActivePermitsService: DownloadService<PermitTx>, watcherDataService: WatcherDataService): Promise<void>;
    private processRequestInputsDownload;
    private initIndexedDB;
}
