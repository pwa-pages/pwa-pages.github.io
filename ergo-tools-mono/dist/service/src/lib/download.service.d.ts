interface AddressData {
    address: string;
}
interface TransactionItem {
    outputCreatedAt: string | number | Date;
    timestamp: string;
    inputs: Input[];
    outputs: Output[];
    id: string;
}
interface FetchTransactionsResponse {
    transactions: TransactionItem[];
    items: TransactionItem[];
    total: number;
}
interface DownloadStatus {
    address: string;
    Address: string;
    status: string;
    lastDownloadDate: Date | undefined;
}
declare class DownloadService<T> {
    private dataService;
    private myWatcherDataService;
    private eventSender;
    private db;
    private busyCounter;
    private downloadFullSize;
    private downloadInitialSize;
    constructor(downloadFullSize: number, downloadInitialSize: number, dataService: DataService<T>, myWatcherDataService: MyWatcherDataService, eventSender: EventSender, db: IDBDatabase);
    fetchTransactions(url: string): Promise<FetchTransactionsResponse>;
    downloadTransactions(address: string, offset: number | undefined, limit: number | undefined, useNode: boolean): Promise<FetchTransactionsResponse>;
    downloadForAddresses(): Promise<void>;
    downloadForChainPermitAddresses(addresses: string[]): Promise<void>;
    downloadForActivePermitAddresses(allAddresses: string[], chainType: string): Promise<void>;
    private increaseBusyCounter;
    private decreaseBusyCounter;
    downloadAllForAddress(address: string, offset: number, db: IDBDatabase, useNode: boolean, callback?: () => Promise<void>): Promise<void>;
    getDownloadStatus(address: string, db: IDBDatabase): Promise<DownloadStatus>;
    setDownloadStatus(address: string, status: string, db: IDBDatabase): Promise<void>;
    saveDownloadStatus(downloadStatus: DownloadStatus, db: IDBDatabase): Promise<void>;
    downloadForAddress(address: string, useNode: boolean, callback?: () => Promise<void>): Promise<void>;
}
