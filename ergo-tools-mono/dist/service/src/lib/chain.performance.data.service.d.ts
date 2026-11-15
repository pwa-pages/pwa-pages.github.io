import { ChainType } from "./chain.service";
import { IStorageService } from "./constants";
import { DataService } from "./data.service";
import { PerfTx, TransactionItem } from "./models";
import { EventSender } from "./process.event.service";
export declare class ChainPerformanceDataService extends DataService<PerfTx> {
    private eventSender;
    getData(): Promise<PerfTx[] | null>;
    getExistingData(transaction: TransactionItem): Promise<PerfTx | null>;
    addData(_address: string, transactions: TransactionItem[]): Promise<void>;
    getPerfTxs(): Promise<Record<ChainType, {
        chart: number;
    }>>;
    constructor(db: IStorageService, eventSender: EventSender);
    getMaxDownloadDateDifference(): number;
    getDataType(): string;
}
