interface PerfTx {
    id: string;
    timestamp: string;
    chainType?: string;
    amount: number;
    decimals?: number;
}
declare class ChainPerformanceDataService extends DataService<PerfTx> {
    db: IDBDatabase;
    private eventSender;
    getExistingData(transaction: TransactionItem): Promise<PerfTx | null>;
    addData(_address: string, transactions: TransactionItem[]): Promise<void>;
    getPerfTxs(): Promise<Record<ChainType, {
        chart: number;
    }>>;
    constructor(db: IDBDatabase, eventSender: EventSender);
    getMaxDownloadDateDifference(): number;
    getDataType(): string;
}
