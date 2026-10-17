

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ReportsDataService extends PermitsDataService {
  constructor(db: IDBDatabase | IStorageService<PermitTx>, private eventSender: EventSender, storeName = rs_ReportsStoreName, maxDownloadDateDifference: number = 204800000) {
    super(db, storeName, maxDownloadDateDifference);
  }


  override getDataType(): string {
    return 'report';
  }


  override async purgeData(): Promise<void> {


  }

  async getAdressPermitsByChainType(
    chainType: string,
    activeOnly: boolean,
    startMonth: number | null,
    startYear: number | null,
    endMonth: number | null,
    endYear: number | null
  ): Promise<PermitTx[]> {
      var permits = await super.getAdressPermits(activeOnly, startMonth, startYear, endMonth, endYear); 

     
      permits = permits.filter((tx) => !Object.values(permitTriggerAddresses).includes(tx.address));
      permits = permits.filter((tx) => tx.chainType === chainType);
      return permits;
  }

  override async addData(
    address: string,
    transactions: TransactionItem[]
  ): Promise<void> {
    await super.addData(address, transactions);

    var chainType = getChainTypeForPermitTriggerAddress(address);

    if (chainType === undefined || chainType === null) {
      return;
    }

    const permitTxs = (await this.getAdressPermitsByChainType(chainType.toString(), false, null, null, null, null));

    this.eventSender?.sendEvent({
      type: 'ReportsChanged',
      data: permitTxs,
    });
  }


  override getMaxDownloadDateDifference(): number {
    const now = new Date();
    const firstOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return now.getTime() - firstOfPreviousMonth.getTime() + 2 * 24 * 60 * 60 * 1000;
  }

  /*
    public async getAddressPermits(address: string): Promise<PermitTx[]> {
      const now = new Date();
        var permits = super.getAdressPermits(true, now.getMonth(), now.getFullYear(), now.getMonth(), now.getFullYear());
        return [];
    }
        */

}

(globalThis as any).GetWatcherDataService = (
  permitsDataService: PermitsDataService
): WatcherDataService => {

  return new WatcherDataService(permitsDataService);

};
