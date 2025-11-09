interface OpenBoxes {
    address: string;
    openBoxesJson: string;
}
declare class ActivePermitsDataService extends DataService<PermitTx> {
    db: IDBDatabase;
    getExistingData(transaction: TransactionItem, address: string): Promise<PermitTx | null>;
    constructor(db: IDBDatabase);
    createUniqueId(boxId: string, transactionId: string, address: string): string;
    getDataType(): string;
    getMaxDownloadDateDifference(): number;
    private getWatcherPermits;
    downloadOpenBoxes(chainType: string): Promise<void>;
    saveOpenBoxes(address: string, openBoxesJson: string, db: IDBDatabase): Promise<void>;
    getOpenBoxesMap(db: IDBDatabase): Promise<Record<string, string | null> | null>;
    shouldAddInputToDb(address: string): boolean;
    shouldAddOutputToDb(address: string): boolean;
    getAdressActivePermits(addresses?: string[] | null): Promise<PermitTx[]>;
    addData(address: string, transactions: TransactionItem[], db: IDBDatabase): Promise<void>;
    purgeData(db: IDBDatabase): Promise<void>;
    private getDataById;
    getSortedPermits(): Promise<PermitTx[]>;
}
