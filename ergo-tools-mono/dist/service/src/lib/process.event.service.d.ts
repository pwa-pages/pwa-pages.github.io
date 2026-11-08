import { ChainPerformanceDataService } from "./chain.performance.data.service";
import { ChartService } from "./chart.service";
import { DownloadService } from "./download.service";
import { DbInput, PerfTx, PermitTx, EventType } from "./models";
import { PermitsDataService } from "./permits.data.service";
import { ReportsDataService } from "./reports.data.service";
import { RewardDataService } from "./reward.data.service";
import { MyWatcherDataService } from "./mywatcher.data.service";
export interface EventPayload<T> {
    type: EventType;
    data?: T;
}
export interface EventSender {
    sendEvent<T>(event: EventPayload<T>): Promise<void>;
}
interface Services {
    dataService: RewardDataService;
    chainPerformanceDataService: ChainPerformanceDataService;
    watcherDataService: MyWatcherDataService;
    permitsDataService: PermitsDataService;
    downloadService: DownloadService<DbInput>;
    chartService: ChartService;
    downloadPerfService: DownloadService<PerfTx>;
    downloadMyWatchersService: DownloadService<PermitTx>;
    downloadActivePermitsService: DownloadService<PermitTx>;
    reportsDataService: ReportsDataService;
    downloadReportsService: DownloadService<PermitTx>;
}
export declare class ServiceWorkerEventSender implements EventSender {
    sendEvent<T>(event: EventPayload<T>): Promise<void>;
}
export declare class ProcessEventService {
    private eventSender;
    constructor(eventSender: EventSender);
    processEvent(event: EventPayload<object>): Promise<void>;
    private initIndexedDB;
    private processReportsRequested;
    private processRequestInputsDownload;
    private processStatisticsScreenLoaded;
    private processPerformanceScreenLoaded;
    private processMyWatchersScreenLoaded;
    private extractChainTypes;
    private processActivePermits;
    downloadForChainPermitAddresses(addresses: string[], services: Services): Promise<void>;
    private downloadForChainPermitAddress;
    private sendPermitChangedEvent;
    private sendPermitsChangedEvent;
    downloadForActivePermitAddresses(allAddresses: string[], chainType: string, services: Services): Promise<void>;
    private downloadForActivePermitAddress;
    private sendPermitsChangedEventForAddresses;
}
export declare const CreateProcessEventService: (eventSender: EventSender) => ProcessEventService;
export {};
