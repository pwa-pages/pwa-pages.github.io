import { Observable } from 'rxjs';
import { EventSender } from '.';
import { IStorageService, WatcherInfo } from '.';
export declare class DownloadService {
    private eventSender;
    private storageService;
    private static readonly maxLoggedUrlLength;
    private activeDownloads;
    private useNode;
    constructor(eventSender: EventSender, storageService: IStorageService);
    downloadPermitInfo<T>(watcherUrl: string): Promise<T>;
    download<T>(url: string): Promise<T>;
    private formatUrlForLog;
    private initiateDownload;
    private endDownload;
    downloadBalance(address: string): Observable<WatcherInfo>;
    downloadStream<T>(url: string): Observable<T>;
    downloadPostStream<T>(url: string, body: string): Observable<T>;
    private downloadWithCache;
}
