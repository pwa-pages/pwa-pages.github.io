import { ChainType } from "./chain.service";
import { DataService, TransactionItem, PerfTx } from "./data.service";
import { EventSender } from "./process.event.service";
export declare class ChainPerformanceDataService extends DataService<PerfTx> {
    db: IDBDatabase;
    private eventSender;
    getData(): Promise<PerfTx[] | null>;
    getExistingData(transaction: TransactionItem): Promise<PerfTx | null>;
    addData(_address: string, transactions: TransactionItem[]): Promise<void>;
    getPerfTxs(): Promise<Record<ChainType, {
        chart: number;
    }>>;
    constructor(db: IDBDatabase, eventSender: EventSender);
    getMaxDownloadDateDifference(): number;
    getDataType(): string;
}
