import { Observable } from 'rxjs';
import { IStorageService, WatcherInfo } from '.';
export declare class DownloadService {
    private storageService;
    private static readonly maxLoggedUrlLength;
    private useNode;
    constructor(storageService: IStorageService);
    downloadPermitInfo<T>(watcherUrl: string): Promise<T>;
    download<T>(url: string): Promise<T>;
    private formatUrlForLog;
    downloadBalance(address: string): Observable<WatcherInfo>;
    downloadStream<T>(url: string): Observable<T>;
    downloadPostStream<T>(url: string, body: string): Observable<T>;
    private downloadWithCache;
}
