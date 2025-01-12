// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface DataService {
  getData<T>(rs_AddressDataStoreName: string): Promise<T[]>;
  addData(
    address: string,
    transactions: TransactionItem[],
    db: IDBDatabase,
    profile: string | undefined,
  ): Promise<void>;
  getDataType(): string;
  getDataByBoxId(boxId: string, address: string, db: IDBDatabase): Promise<DbInput | null>;
}
