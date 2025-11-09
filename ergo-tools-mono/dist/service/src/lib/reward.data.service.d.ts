declare class RewardDataService extends DataService<DbInput> {
    db: IDBDatabase;
    private chartService;
    private eventSender;
    getExistingData(transaction: TransactionItem, address: string): Promise<DbInput | null>;
    constructor(db: IDBDatabase, chartService: ChartService, eventSender: EventSender);
    getDataType(): string;
    private getWatcherInputs;
    addData(address: string, transactions: TransactionItem[], db: IDBDatabase): Promise<void>;
    private getDataByBoxId;
    getSortedInputs(): Promise<Input[]>;
}
