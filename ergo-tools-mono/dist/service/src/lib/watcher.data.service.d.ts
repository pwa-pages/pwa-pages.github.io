import { Asset } from "./asset";
import { DataService, PermitTx, TransactionItem, PermitInfo } from "./data.service";
import { PermitsDataService } from "./permits.data.service";
export declare class WatcherDataService extends DataService<PermitTx> {
    private permitsDataService;
    getData(): Promise<PermitTx[] | null>;
    getExistingData(transaction: TransactionItem, address: string): Promise<PermitTx | null>;
    constructor(permitsDataService: PermitsDataService);
    createUniqueId(boxId: string, transactionId: string, address: string): string;
    getDataType(): string;
    private getWatcherPermits;
    shouldAddToDb(address: string, assets: Asset[]): boolean;
    getAdressPermits(addresses: string[] | null): Promise<PermitInfo[]>;
    addData(address: string, transactions: TransactionItem[]): Promise<void>;
    getSortedPermits(): Promise<PermitTx[]>;
}
