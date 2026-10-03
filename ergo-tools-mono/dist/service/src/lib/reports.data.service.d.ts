declare class ReportsDataService extends PermitsDataService {
    constructor(db: IDBDatabase | IStorageService<PermitTx>, storeName?: string, maxDownloadDateDifference?: number);
    getDataType(): string;
    purgeData(): Promise<void>;
    getMaxDownloadDateDifference(): number;
}
