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
declare class DownloadStatusIndexedDbService<T> {
    private dataService;
    private db;
    constructor(dataService: DataService<T>, db: IDBDatabase);
    getDownloadStatus(address: string): Promise<DownloadStatus>;
    setDownloadStatus(address: string, status: string): Promise<void>;
    saveDownloadStatus(downloadStatus: DownloadStatus): Promise<void>;
}
