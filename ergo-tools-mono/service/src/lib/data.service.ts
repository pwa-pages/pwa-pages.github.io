import { IStorageService } from "./constants";
import { IDBDatabaseStorageService } from "./i-db-databasestorage.service";
import { TransactionItem } from "./models";



// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class DataService<T> {
  public storageService: IStorageService<T>;
  public db?: IDBDatabase;
  constructor(dbOrStorage: IDBDatabase | IStorageService<T>) {
    
    if ((dbOrStorage as IDBDatabase)?.transaction !== undefined) {
      this.db = dbOrStorage as IDBDatabase;
      this.storageService = new IDBDatabaseStorageService<T>(this.db);
    } else {
      this.storageService = dbOrStorage as IStorageService<T>;
    }
  }

  abstract addData(
    address: string,
    transactions: TransactionItem[]
  ): Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async purgeData(): Promise<void> {
    // Empty implementation
  }

  abstract getDataType(): string;
  getMaxDownloadDateDifference(): number {
    return 3155760000000;
  }

  abstract getExistingData(
    transaction: TransactionItem,
    address: string,
  ): Promise<T | null>;

  abstract getData(
  ): Promise<T[] | null>;

}
