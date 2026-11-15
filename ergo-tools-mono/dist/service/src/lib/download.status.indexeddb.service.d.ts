import { DataService } from "./data.service";
import { DownloadStatusService } from "./download.status.service";
import { DownloadStatus } from "./models";
export declare class DownloadStatusIndexedDbService<T> implements DownloadStatusService {
    private dataService;
    private db;
    constructor(dataService: DataService<T>, db: IDBDatabase);
    getDownloadStatus(address: string): Promise<DownloadStatus>;
    setDownloadStatus(address: string, status: string): Promise<void>;
    saveDownloadStatus(downloadStatus: DownloadStatus): Promise<void>;
}
