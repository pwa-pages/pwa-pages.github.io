import { Address } from "./address";
import { Asset } from "./asset";
import { ChainType } from "./chain.service";
import { IStorageService } from "./constants";
import { Input } from "./input";
export declare class ChartPoint {
    x: Date;
    y: number;
    constructor(x: Date, y: number);
}
export declare class ChartPerformance {
    address: string;
    addressForDisplay: string;
    chart: ChartPoint[];
    chainType: string | null;
    color: string;
    constructor(address: string, addressForDisplay: string, chart: ChartPoint[], color: string, chainType: string | null);
}
export declare class ChainChartPerformance {
    address: string;
    addressForDisplay: string;
    chart: number;
    chainType: string | null;
    color: string;
    constructor(address: string, addressForDisplay: string, chart: number, color: string, chainType: string | null);
}
export interface MessageEventData {
    type: string;
    data: string;
}
export interface TransactionItem {
    timestamp: string;
    inputs: Input[];
    outputs: Output[];
    id: string;
}
export interface FetchTransactionsResponse {
    transactions: TransactionItem[];
    items: TransactionItem[];
    total: number;
}
export interface DownloadStatus {
    address: string;
    Address: string;
    status: string;
    lastDownloadDate: Date | undefined;
}
export interface PerfTx {
    id: string;
    timestamp: string;
    chainType?: string;
    amount: number;
    decimals?: number;
}
export interface OpenBoxes {
    address: string;
    openBoxesJson: string;
}
export interface PermitTx {
    id: string;
    date: Date;
    boxId: string;
    assets: Asset[];
    address: string;
    chainType?: string;
    wid: string;
    transactionId: string;
}
export interface PermitInfo {
    lockedRSN: number;
    activeLockedRSN: number;
    address: string;
    wid: string;
    chainType: ChainType;
}
export interface DbInput {
    outputAddress: string;
    inputDate: Date;
    boxId: string;
    assets: Asset[];
    address?: string;
    chainType?: string;
}
export interface Output {
    boxId: string;
    outputDate: Date;
    assets: Asset[];
    address: string;
}
export declare abstract class DataService<T> {
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
export { Address };
