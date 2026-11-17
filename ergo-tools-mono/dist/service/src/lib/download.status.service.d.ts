import { IStorageService } from "./constants";
import { DataService } from "./data.service";
import { DownloadStatus } from "./models";
export interface DownloadStatusServiceContract {
    getDownloadStatus(address: string): Promise<DownloadStatus>;
    setDownloadStatus(address: string, status: string): Promise<void>;
    saveDownloadStatus(downloadStatus: DownloadStatus): Promise<void>;
}
export declare class DownloadStatusService<T = unknown> implements DownloadStatusServiceContract {
    private dataService;
    private db;
    constructor(dataService: DataService<T>, db: IStorageService);
    getDownloadStatus(address: string): Promise<DownloadStatus>;
    setDownloadStatus(address: string, status: string): Promise<void>;
    saveDownloadStatus(downloadStatus: DownloadStatus): Promise<void>;
}
