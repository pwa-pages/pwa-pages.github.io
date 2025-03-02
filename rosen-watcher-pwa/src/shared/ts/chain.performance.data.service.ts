interface DbPerfTx {
  id: string;
  timestamp: string;
  chainType?: string;
  amount: number;
  decimals?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ChainPerformanceDataService extends DataService<DbPerfTx> {
  override async getExistingData(transaction: TransactionItem): Promise<DbPerfTx | null> {
    return new Promise((resolve, reject) => {
      const dbTtransaction: IDBTransaction = this.db.transaction([rs_PerfTxStoreName], 'readonly');
      const objectStore: IDBObjectStore = dbTtransaction.objectStore(rs_PerfTxStoreName);
      const request: IDBRequest = objectStore.get(transaction.id);

      request.onsuccess = () => {
        const result: DbPerfTx | null = request.result as DbPerfTx | null;
        resolve(result);
      };

      request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }
  override async addData(
    _address: string,
    transactions: TransactionItem[],
    db: IDBDatabase,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _profile: string | undefined,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const tempData: DbPerfTx[] = [];

      transactions.forEach((item: TransactionItem) => {
        const eRSNTotal = item.outputs.reduce((total, output) => {
          const assets = output.assets.filter((a) => a.name === 'eRSN');
          return total + assets.reduce((acc, asset) => acc + asset.amount, 0);
        }, 0);

        const dbPerfTx: DbPerfTx = {
          id: item.id,
          timestamp: item.timestamp,
          amount: eRSNTotal,
        };

        tempData.push(dbPerfTx);
      });

      const transaction: IDBTransaction = db.transaction([rs_PerfTxStoreName], 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(rs_PerfTxStoreName);

      const putPromises = tempData.map((dbPerfTx: DbPerfTx) => {
        return new Promise<void>((putResolve, putReject) => {
          console.log('Trying to add dbPerfTx to db with id ' + dbPerfTx.id);
          const request: IDBRequest = objectStore.put(dbPerfTx);
          request.onsuccess = () => putResolve();
          request.onerror = (event: Event) => putReject((event.target as IDBRequest).error);
        });
      });

      Promise.all(putPromises)
        .then(async () => {
          /*
          const inputs = await this.getSortedInputs();
          sendMessageToClients({ type: 'InputsChanged', data: inputs, profile: profile });
          sendMessageToClients({
            type: 'AddressChartChanged',
            data: await this.chartService.getAddressCharts(inputs),
            profile: profile,
          });
          */
          resolve();
        })
        .catch(reject);
    });
  }

  constructor(public override db: IDBDatabase) {
    super(db);
  }

  override getMaxDownloadDateDifference(): number {
    return 604800000;
  }

  getDataType(): string {
    return 'performance_chart';
  }
}
