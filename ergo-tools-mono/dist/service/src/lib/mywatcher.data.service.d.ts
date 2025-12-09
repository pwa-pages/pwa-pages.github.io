declare class MyWatcherDataService extends DataService<PermitTx> {
    db: IDBDatabase;
    private activePermitsDataService;
    getExistingData(transaction: TransactionItem, address: string): Promise<PermitTx | null>;
    constructor(db: IDBDatabase, activePermitsDataService: ActivePermitsDataService);
    createUniqueId(boxId: string, transactionId: string, address: string): string;
    getDataType(): string;
    private getWatcherPermits;
    shouldAddToDb(address: string, assets: Asset[]): boolean;
    getAdressPermits(addresses: string[]): Promise<PermitInfo[]>;
    addData(address: string, transactions: TransactionItem[]): Promise<void>;
    getSortedPermits(): Promise<PermitTx[]>;
}
