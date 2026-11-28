import { IStorageService } from "./constants";
import { TransactionItem } from "./models";



// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class DataService<T> {
  public storageService: IStorageService;
  public db?: IDBDatabase;
  constructor(storageService: IStorageService) {

    this.storageService = storageService;
  }

  allDataAvailable(_: string): Promise<void>{
    // Empty implementation
    return Promise.resolve();
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
