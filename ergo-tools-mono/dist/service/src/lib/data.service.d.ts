interface Asset {
    id: string;
    name: string;
    quantity: number;
    amount: number;
    decimals: number;
    tokenId: string | null;
}
interface PermitTx {
    id: string;
    date: Date;
    boxId: string;
    assets: Asset[];
    address: string;
    chainType?: string;
    wid: string;
    transactionId: string;
}
interface PermitInfo {
    lockedRSN: number;
    activeLockedRSN: number;
    address: string;
    wid: string;
    chainType: ChainType;
}
interface DbInput {
    outputAddress: string;
    inputDate: Date;
    boxId: string;
    assets: Asset[];
    address?: string;
    chainType?: string;
}
interface Input {
    boxId: string;
    outputAddress: string;
    inputDate: Date;
    assets: Asset[];
    address: string;
    amount?: number;
    accumulatedAmount?: number;
    chainType?: ChainType | null;
}
interface Output {
    boxId: string;
    outputDate: Date;
    assets: Asset[];
    address: string;
}
declare abstract class DataService<T> {
    db: IDBDatabase;
    constructor(db: IDBDatabase);
    abstract addData(address: string, transactions: TransactionItem[]): Promise<void>;
    purgeData(): Promise<void>;
    abstract getDataType(): string;
    getMaxDownloadDateDifference(): number;
    abstract getExistingData(transaction: TransactionItem, address: string): Promise<T | null>;
    getData<T>(storeName: string): Promise<T[]>;
    getDataWithCursor<T>(storeName: string, filterFn?: (item: T) => boolean): Promise<T[]>;
}
