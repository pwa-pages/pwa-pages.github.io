import { IStorageService } from "./constants";
import { TransactionItem } from "./models";
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
