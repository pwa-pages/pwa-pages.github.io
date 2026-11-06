import { Address } from "./address";
import { Asset } from "./asset";
import { ChainType } from "./chain.service";
import { IStorageService } from "./constants";
import { IDBDatabaseStorageService } from "./i-db-databasestorage.service";
import { Input } from "./input";

export class ChartPoint {
  x: Date;
  y: number;

  constructor(x: Date, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class ChartPerformance {
  address: string;
  addressForDisplay: string;
  chart: ChartPoint[];
  chainType: string | null;
  color: string;

  constructor(
    address: string,
    addressForDisplay: string,
    chart: ChartPoint[],
    color: string,
    chainType: string | null,
  ) {
    this.address = address;
    this.addressForDisplay = addressForDisplay;
    this.chart = chart;
    this.chainType = chainType;
    this.color = color;
  }
}

export class ChainChartPerformance {
  address: string;
  addressForDisplay: string;
  chart: number;
  chainType: string | null;
  color: string;

  constructor(
    address: string,
    addressForDisplay: string,
    chart: number,
    color: string,
    chainType: string | null,
  ) {
    this.address = address;
    this.addressForDisplay = addressForDisplay;
    this.chart = chart;
    this.chainType = chainType;
    this.color = color;
  }
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface PermitInfo {
  lockedRSN: number;
  activeLockedRSN: number;
  address: string;
  wid: string;
  chainType: ChainType;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface DbInput {
  outputAddress: string;
  inputDate: Date;
  boxId: string;
  assets: Asset[];
  address?: string;
  chainType?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Output {
  boxId: string;
  outputDate: Date;
  assets: Asset[];
  address: string;
}

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
export { Address };

