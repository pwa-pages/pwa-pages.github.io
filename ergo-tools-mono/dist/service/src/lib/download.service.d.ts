declare class DownloadService<T> {
    private dataService;
    private eventSender;
    private downloadStatusIndexedDbService;
    private busyCounter;
    private downloadFullSize;
    private downloadInitialSize;
    constructor(downloadFullSize: number, downloadInitialSize: number, dataService: DataService<T>, eventSender: EventSender, downloadStatusIndexedDbService: DownloadStatusIndexedDbService<T> | null);
    fetchTransactions(url: string): Promise<FetchTransactionsResponse>;
    downloadTransactions(address: string, offset: number | undefined, limit: number | undefined, useNode: boolean): Promise<FetchTransactionsResponse>;
    downloadForAddresses(): Promise<void>;
    private increaseBusyCounter;
    private decreaseBusyCounter;
    downloadAllForAddress(address: string, offset: number, useNode: boolean, callback?: () => Promise<void>): Promise<void>;
    downloadForAddress(address: string, useNode: boolean, callback?: () => Promise<void>): Promise<T[] | null>;
}
