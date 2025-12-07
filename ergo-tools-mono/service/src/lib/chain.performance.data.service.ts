interface PerfTx {
  id: string;
  timestamp: string;
  chainType?: string;
  amount: number;
  decimals?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ChainPerformanceDataService extends DataService<PerfTx> {
  override async getExistingData(
    transaction: TransactionItem,
  ): Promise<PerfTx | null> {

    return await this.storageService.getDataById(rs_PerfTxStoreName, transaction.id);
  }
  override async addData(
    _address: string,
    transactions: TransactionItem[],
  ): Promise<void> {

    const tempData: PerfTx[] = [];

    transactions.forEach((item: TransactionItem) => {
      const chainTokensCount: Record<string, number> = {};
      const eRSNTotal = item.outputs.reduce((total, output) => {
        output.assets.forEach((asset) => {
          if (asset.tokenId != null && asset.tokenId in rwtTokenIds) {
            if (!chainTokensCount[asset.tokenId]) {
              chainTokensCount[asset.tokenId] = 1;
            } else {
              chainTokensCount[asset.tokenId]++;
            }
          }
        });

        const assets = output.assets.filter(
          (a) =>
            a.tokenId === rs_eRSNTokenId &&
            Object.values(rewardAddresses).includes(output.address),
        );

        return (
          total +
          assets.reduce(
            (acc, asset) => acc + asset.amount / Math.pow(10, rs_RSNDecimals),
            0,
          )
        );
      }, 0);

      const maxKey = Object.entries(chainTokensCount).reduce(
        (max, [key, value]) => (value > chainTokensCount[max] ? key : max),
        Object.keys(chainTokensCount)[0],
      );

      const chainType = Object.entries(rwtTokenIds).find(
        ([key]) => key === maxKey,
      )?.[1];

      const dbPerfTx: PerfTx = {
        id: item.id,
        timestamp: item.timestamp,
        amount: eRSNTotal,
        chainType: chainType,
      };

      tempData.push(dbPerfTx);
    });

    await this.storageService.addData(rs_PerfTxStoreName, tempData);

    const perfTxs = await this.getPerfTxs();
    this.eventSender.sendEvent({
      type: 'PerfChartChanged',
      data: perfTxs,
    });


  }
  public async getPerfTxs(): Promise<Record<ChainType, { chart: number }>> {
    const perfTxsPromise = this.getData<PerfTx>(rs_PerfTxStoreName);

    console.log('Retrieving PerfTxs');

    try {
      let perfTxs = await perfTxsPromise;
      perfTxs = perfTxs.filter(
        (p) =>
          this.getMaxDownloadDateDifference() >
          new Date().getTime() - new Date(p.timestamp).getTime(),
      );

      const result = perfTxs.reduce(
        (acc, tx) => {
          if (tx.chainType !== undefined && tx.chainType !== null) {
            const chainKey = tx.chainType as ChainType;

            if (!acc[chainKey]) {
              acc[chainKey] = { chart: 0 };
            }

            acc[chainKey].chart += tx.amount ?? 0;
          }
          return acc;
        },
        {} as Record<ChainType, { chart: number }>,
      );

      return Object.fromEntries(
        Object.values(ChainType).map((chain) => [
          chain,
          result[chain] || { chart: 0 },
        ]),
      ) as Record<ChainType, { chart: number }>;
    } catch (error) {
      console.error(error);
      return {} as Record<ChainType, { chart: number }>;
    }
  }

  constructor(
    public override db: IDBDatabase,
    private eventSender: EventSender,
  ) {
    super(db);
  }

  override getMaxDownloadDateDifference(): number {
    return 604800000;
  }

  getDataType(): string {
    return 'performance_chart';
  }
}
