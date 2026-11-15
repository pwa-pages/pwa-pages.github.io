import { IStorageService } from "./constants";
import { DataService } from "./data.service";
import { DownloadStatusService } from "./download.status.service";
import { DownloadStatus } from "./models";
export declare class DownloadStatusMemoryService<T> implements DownloadStatusService {
    private dataService;
    private db;
    constructor(dataService: DataService<T>, db: IStorageService);
    getDownloadStatus(address: string): Promise<DownloadStatus>;
    setDownloadStatus(address: string, status: string): Promise<void>;
    saveDownloadStatus(downloadStatus: DownloadStatus): Promise<void>;
}
