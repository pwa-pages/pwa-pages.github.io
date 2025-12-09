interface Asset {
  id: string;
  name: string;
  quantity: number;
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
  public storageService: StorageService<T>;
  constructor(public db: IDBDatabase) {
    this.storageService = new StorageService<T>(db);
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

}
