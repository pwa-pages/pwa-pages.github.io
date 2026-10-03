

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ReportsDataService extends PermitsDataService {
  constructor(db: IDBDatabase | IStorageService<PermitTx>, storeName = rs_ActivePermitTxStoreName, maxDownloadDateDifference: number = 204800000) {
    super(db, storeName, maxDownloadDateDifference);
  }


  override getDataType(): string {
    return 'report';
  }


  override async purgeData(): Promise<void> {


  }

  override getMaxDownloadDateDifference(): number {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return now.getTime() - firstOfMonth.getTime() + 2 * 24 * 60 * 60 * 1000;
  }


}

(globalThis as any).GetWatcherDataService = (
  permitsDataService: PermitsDataService
): WatcherDataService => {

  return new WatcherDataService(permitsDataService);

};
