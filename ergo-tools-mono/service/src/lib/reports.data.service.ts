

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


  async getWatcherPerformanceByChainType(
  ): Promise<WatchersPerformanceStats> {
    const permits = await super.getAdressPermits(false, null, null, null, null);
    const reportCountsByChainTypeAndMonth: Record<string, Record<string, Record<string, number>>> = {};

    permits.forEach((permit: PermitTx) => {
      if (!permit.chainType || !permit.address || Number.isNaN(permit.date.getTime())) {
        return;
      }
      const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(permit.date);

      const monthCounts =
        reportCountsByChainTypeAndMonth[permit.chainType] ??
        (reportCountsByChainTypeAndMonth[permit.chainType] = {});
      const addressCounts = monthCounts[month] ?? (monthCounts[month] = {});

      addressCounts[permit.address] = (addressCounts[permit.address] ?? 0) + 1;
    });

    const watcherPerformanceByChainType: Record<string, Record<string, WatcherPerformanceAddressStat[]>> = {};

    Object.entries(reportCountsByChainTypeAndMonth).forEach(([chain, monthCounts]) => {
      watcherPerformanceByChainType[chain] = {};
      Object.entries(monthCounts).forEach(([month, addressCounts]) => {
        const addressStats = Object.entries(addressCounts)
          .map(([address, reports]) => ({
            address: {
              address,
              chainType: chain
            } as Address,
            reports
          }))
          .sort((a, b) => b.reports - a.reports);

        if (addressStats.length > 0) {
          watcherPerformanceByChainType[chain][month] = addressStats;
        }
      });
    });

    const watcherPerformanceStats: WatchersPerformanceStats = {
      watcherPerformances: watcherPerformanceByChainType
    };
    return watcherPerformanceStats;
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

    var performances = await this.getWatcherPerformanceByChainType();

    this.eventSender?.sendEvent({
      type: 'ReportsChanged',
      data: performances,
    });
  }


  override getMaxDownloadDateDifference(): number {
    const now = new Date();
    const firstOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return now.getTime() - firstOfPreviousMonth.getTime() + 2 * 24 * 60 * 60 * 1000;
  }

}

(globalThis as any).GetWatcherDataService = (
  permitsDataService: PermitsDataService
): WatcherDataService => {

  return new WatcherDataService(permitsDataService);

};
