import { IStorageService } from "./constants";
import { PermitTx, WatchersPerformanceStats, TransactionItem } from "./models";
import { PermitsDataService } from "./permits.data.service";
import { EventSender } from "./process.event.service";
export declare class ReportsDataService extends PermitsDataService {
    private eventSender;
    constructor(db: IDBDatabase | IStorageService<PermitTx>, eventSender: EventSender, storeName?: string, maxDownloadDateDifference?: number);
    getDataType(): string;
    purgeData(): Promise<void>;
    getWatcherPerformanceByChainTypeFromReports(): Promise<WatchersPerformanceStats>;
    getWatcherPerformanceByChainType(): Promise<WatchersPerformanceStats>;
    getAdressPermitsByChainType(chainType: string, activeOnly: boolean, startMonth: number | null, startYear: number | null, endMonth: number | null, endYear: number | null): Promise<PermitTx[]>;
    addData(address: string, transactions: TransactionItem[]): Promise<void>;
    getMaxDownloadDateDifference(): number;
}
