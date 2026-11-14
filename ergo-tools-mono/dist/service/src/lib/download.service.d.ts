import { Observable } from 'rxjs';
import { EventSender } from '.';
import { IStorageService, WatcherInfo } from '.';
export declare class DownloadService<T> {
    private eventSender;
    private dbOrStorage;
    private activeDownloads;
    private useNode;
    constructor(eventSender: EventSender, dbOrStorage: IDBDatabase | IStorageService<T>);
    downloadPermitInfo<T>(watcherUrl: string): Promise<T>;
    download<T>(url: string): Promise<T>;
    private initiateDownload;
    private endDownload;
    downloadBalance(address: string): Observable<WatcherInfo>;
    downloadStream<T>(url: string): Observable<T>;
    downloadPostStream<T>(url: string, body: string): Observable<T>;
    private downloadWithCache;
}
