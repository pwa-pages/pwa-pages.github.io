interface MessageEventData {
  type: string;
  data: string;
}

interface Address {
  address: string;
  Address: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PermitInfo {
  lockedRSN: number;
  activeLockedRSN: number;
  address: string;
  wid: string;
  chainType: ChainType;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface DbInput {
  outputAddress: string;
  inputDate: Date;
  boxId: string;
  assets: Asset[];
  address?: string;
  chainType?: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Output {
  boxId: string;
  outputDate: Date;
  assets: Asset[];
  address: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class DataService<T> {
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
