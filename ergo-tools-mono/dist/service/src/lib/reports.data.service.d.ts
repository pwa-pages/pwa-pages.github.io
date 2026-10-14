declare class ReportsDataService extends PermitsDataService {
    private eventSender;
    constructor(db: IDBDatabase | IStorageService<PermitTx>, eventSender: EventSender, storeName?: string, maxDownloadDateDifference?: number);
    getDataType(): string;
    purgeData(): Promise<void>;
    getAdressPermits(activeOnly: boolean, startMonth: number | null, startYear: number | null, endMonth: number | null, endYear: number | null): Promise<PermitTx[]>;
    addData(address: string, transactions: TransactionItem[]): Promise<void>;
    getMaxDownloadDateDifference(): number;
}
