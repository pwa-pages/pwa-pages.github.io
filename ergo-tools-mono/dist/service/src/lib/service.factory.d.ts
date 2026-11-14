import { ChainPerformanceDataService } from "./chain.performance.data.service";
import { ChartService } from "./chart.service";
import { PermitTx, EventType, DbInput, PerfTx } from "./models";
import { MyWatcherDataService } from "./mywatcher.data.service";
import { PermitsDataService } from "./permits.data.service";
import { ReportsDataService } from "./reports.data.service";
import { RewardDataService } from "./reward.data.service";
import { TransactionDownloadService } from "./transaction.download.service";
import { WatchersDataService } from "./watchers.data.service";
export declare const GetPermitTriggerAddresses: () => Record<import("./chain.service").ChainType, string | null>;
export declare function CreatePermitsDownloadService(maxDownloadDateDifference: number): TransactionDownloadService<PermitTx>;
export declare const CreateWatcherDownloadService: () => TransactionDownloadService<PermitTx>;
export interface EventPayload<T> {
    type: EventType;
    data?: T;
}
export interface EventSender {
    sendEvent<T>(event: EventPayload<T>): Promise<void>;
}
export interface Services {
    dataService: RewardDataService;
    chainPerformanceDataService: ChainPerformanceDataService;
    myWatcherDataService: MyWatcherDataService;
    watchersDataService: WatchersDataService;
    permitsDataService: PermitsDataService;
    downloadService: TransactionDownloadService<DbInput>;
    chartService: ChartService;
    downloadPerfService: TransactionDownloadService<PerfTx>;
    downloadMyWatchersService: TransactionDownloadService<PermitTx>;
    downloadActivePermitsService: TransactionDownloadService<PermitTx>;
    reportsDataService: ReportsDataService;
    downloadReportsService: TransactionDownloadService<PermitTx>;
}
export declare function createServices(eventSender: EventSender, db: IDBDatabase): Promise<Services>;
