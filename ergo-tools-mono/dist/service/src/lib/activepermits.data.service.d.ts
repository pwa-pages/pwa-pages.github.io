declare class ActivePermitsDataService extends DataService<PermitTx> {
    private maxDownloadDateDifference;
    getData(): Promise<PermitTx[] | null>;
    getExistingData(transaction: TransactionItem, address: string): Promise<PermitTx | null>;
    constructor(db: IDBDatabase | IStorageService<PermitTx>, maxDownloadDateDifference?: number);
    createUniqueId(boxId: string, transactionId: string, address: string): string;
    getDataType(): string;
    getMaxDownloadDateDifference(): number;
    private getWatcherPermits;
    downloadOpenBoxes(chainType: string): Promise<void>;
    saveOpenBoxes(address: string, openBoxesJson: string): Promise<void>;
    getOpenBoxesMap(): Promise<Record<string, string | null> | null>;
    shouldAddInputToDb(address: string, assets: Asset[]): boolean;
    shouldAddOutputToDb(address: string): boolean;
    getAdressActivePermits(addresses?: string[] | null): Promise<PermitTx[]>;
    addData(address: string, transactions: TransactionItem[]): Promise<void>;
    purgeData(): Promise<void>;
    getSortedPermits(): Promise<PermitTx[]>;
}
