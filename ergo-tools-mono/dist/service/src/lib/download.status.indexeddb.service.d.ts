declare class DownloadStatusIndexedDbService<T> {
    private dataService;
    private db;
    constructor(dataService: DataService<T>, db: IDBDatabase);
    getDownloadStatus(address: string): Promise<DownloadStatus>;
    setDownloadStatus(address: string, status: string): Promise<void>;
    saveDownloadStatus(downloadStatus: DownloadStatus): Promise<void>;
}
