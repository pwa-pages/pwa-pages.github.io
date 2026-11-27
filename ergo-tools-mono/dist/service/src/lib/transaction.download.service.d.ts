import { UrlAction } from "./constants";
import { DataService } from "./data.service";
import { DownloadStatusServiceContract } from "./download.status.service";
import { FetchTransactionsResponse } from "./models";
import { EventSender } from "./process.event.service";
export declare class TransactionDownloadService<T> {
    private dataService;
    private eventSender;
    private downloadStatusServiceContract;
    private busyCounter;
    private downloadFullSize;
    private downloadInitialSize;
    constructor(downloadFullSize: number, downloadInitialSize: number, dataService: DataService<T>, eventSender: EventSender, downloadStatusServiceContract: DownloadStatusServiceContract | null);
    getDataService(): DataService<T>;
    fetchTransactions(url: string): Promise<FetchTransactionsResponse>;
    downloadTransactions(address: string, offset: number | undefined, limit: number | undefined, urlAction: UrlAction): Promise<FetchTransactionsResponse>;
    downloadForAddresses(urlAction: UrlAction): Promise<void>;
    private increaseBusyCounter;
    private decreaseBusyCounter;
    downloadAllForAddress(address: string, offset: number, urlAction: UrlAction, callback?: () => Promise<void>): Promise<void>;
    downloadForAddress(address: string, urlAction: UrlAction, callback?: () => Promise<void>): Promise<T[] | null>;
}
