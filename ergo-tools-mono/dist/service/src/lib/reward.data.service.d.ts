declare class RewardDataService extends DataService<DbInput> {
    db: IDBDatabase;
    private chartService;
    private eventSender;
    getData(): Promise<DbInput[] | null>;
    getExistingData(transaction: TransactionItem, address: string): Promise<DbInput | null>;
    constructor(db: IDBDatabase, chartService: ChartService, eventSender: EventSender);
    getDataType(): string;
    private getWatcherInputs;
    addData(address: string, transactions: TransactionItem[]): Promise<void>;
    private getDataByBoxId;
    getSortedInputs(): Promise<Input[]>;
}
