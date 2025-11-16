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
    private eventSender;
    private downloadStatusIndexedDbService;
    private busyCounter;
    private downloadFullSize;
    private downloadInitialSize;
    constructor(downloadFullSize: number, downloadInitialSize: number, dataService: DataService<T>, eventSender: EventSender, downloadStatusIndexedDbService: DownloadStatusIndexedDbService<T>);
    fetchTransactions(url: string): Promise<FetchTransactionsResponse>;
    downloadTransactions(address: string, offset: number | undefined, limit: number | undefined, useNode: boolean): Promise<FetchTransactionsResponse>;
    downloadForAddresses(): Promise<void>;
    private increaseBusyCounter;
    private decreaseBusyCounter;
    downloadAllForAddress(address: string, offset: number, useNode: boolean, callback?: () => Promise<void>): Promise<void>;
    downloadForAddress(address: string, useNode: boolean, callback?: () => Promise<void>): Promise<void>;
}
