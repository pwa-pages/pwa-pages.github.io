declare class DownloadService<T> {
    private dataService;
    private eventSender;
    private downloadStatusIndexedDbService;
    private busyCounter;
    private downloadFullSize;
    private downloadInitialSize;
    constructor(downloadFullSize: number, downloadInitialSize: number, dataService: DataService<T>, eventSender: EventSender, downloadStatusIndexedDbService: DownloadStatusIndexedDbService<T> | null);
    getDataService(): DataService<T>;
    fetchTransactions(url: string): Promise<FetchTransactionsResponse>;
    downloadTransactions(address: string, offset: number | undefined, limit: number | undefined, urlAction: UrlAction): Promise<FetchTransactionsResponse>;
    downloadForAddresses(urlAction: UrlAction): Promise<void>;
    private increaseBusyCounter;
    private decreaseBusyCounter;
    downloadAllForAddress(address: string, offset: number, urlAction: UrlAction, callback?: () => Promise<void>): Promise<void>;
    downloadForAddress(address: string, urlAction: UrlAction, callback?: () => Promise<void>): Promise<T[] | null>;
}
