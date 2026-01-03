interface MessageEventData {
    type: string;
    data: string;
}
interface Address {
    address: string;
    Address: string;
}
interface MyWatchersStats {
    chainType?: ChainType;
    address?: Address;
}
interface TransactionItem {
    timestamp: string;
    inputs: Input[];
    outputs: Output[];
    id: string;
}
interface FetchTransactionsResponse {
    transactions: TransactionItem[];
    items: TransactionItem[];
    total: number;
}
interface DownloadStatus {
    address: string;
    Address: string;
    status: string;
    lastDownloadDate: Date | undefined;
}
interface FetchTransactionsResponse {
    transactions: TransactionItem[];
    items: TransactionItem[];
    total: number;
}
interface DownloadStatus {
    address: string;
    Address: string;
    status: string;
    lastDownloadDate: Date | undefined;
}
interface PerfTx {
    id: string;
    timestamp: string;
    chainType?: string;
    amount: number;
    decimals?: number;
}
interface OpenBoxes {
    address: string;
    openBoxesJson: string;
}
interface Asset {
    name: string;
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
    storageService: IStorageService<T>;
    db?: IDBDatabase;
    constructor(dbOrStorage: IDBDatabase | IStorageService<T>);
    abstract addData(address: string, transactions: TransactionItem[]): Promise<void>;
    purgeData(): Promise<void>;
    abstract getDataType(): string;
    getMaxDownloadDateDifference(): number;
    abstract getExistingData(transaction: TransactionItem, address: string): Promise<T | null>;
    abstract getData(): Promise<T[] | null>;
}
