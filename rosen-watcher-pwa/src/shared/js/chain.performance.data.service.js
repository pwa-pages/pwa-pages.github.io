// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ChainPerformanceDataService extends DataService {
    db;
    eventSender;
    async getExistingData(transaction) {
        return new Promise((resolve, reject) => {
            const dbTtransaction = this.db.transaction([rs_PerfTxStoreName], 'readonly');
            const objectStore = dbTtransaction.objectStore(rs_PerfTxStoreName);
            const request = objectStore.get(transaction.id);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result);
            };
            request.onerror = (event) => reject(event.target.error);
        });
    }
    async addData(_address, transactions, db) {
        return new Promise((resolve, reject) => {
            const tempData = [];
            transactions.forEach((item) => {
                const chainTokensCount = {};
                const eRSNTotal = item.outputs.reduce((total, output) => {
                    output.assets.forEach((asset) => {
                        if (asset.tokenId != null && asset.tokenId in rwtTokenIds) {
                            if (!chainTokensCount[asset.tokenId]) {
                                chainTokensCount[asset.tokenId] = 1;
                            }
                            else {
                                chainTokensCount[asset.tokenId]++;
                            }
                        }
                    });
                    const assets = output.assets.filter((a) => a.tokenId === rs_eRSNTokenId &&
                        Object.values(rewardAddresses).includes(output.address));
                    return (total +
                        assets.reduce((acc, asset) => acc + asset.amount / Math.pow(10, rs_RSNDecimals), 0));
                }, 0);
                const maxKey = Object.entries(chainTokensCount).reduce((max, [key, value]) => (value > chainTokensCount[max] ? key : max), Object.keys(chainTokensCount)[0]);
                const chainType = Object.entries(rwtTokenIds).find(([key]) => key === maxKey)?.[1];
                const dbPerfTx = {
                    id: item.id,
                    timestamp: item.timestamp,
                    amount: eRSNTotal,
                    chainType: chainType,
                };
                tempData.push(dbPerfTx);
            });
            const transaction = db.transaction([rs_PerfTxStoreName], 'readwrite');
            const objectStore = transaction.objectStore(rs_PerfTxStoreName);
            const putPromises = tempData.map((dbPerfTx) => {
                return new Promise((putResolve, putReject) => {
                    console.log('Trying to add dbPerfTx to db with id ' + dbPerfTx.id);
                    const request = objectStore.put(dbPerfTx);
                    request.onsuccess = () => putResolve();
                    request.onerror = (event) => putReject(event.target.error);
                });
            });
            Promise.all(putPromises)
                .then(async () => {
                const perfTxs = await this.getPerfTxs();
                this.eventSender.sendEvent({
                    type: 'PerfChartChanged',
                    data: perfTxs,
                });
                resolve();
            })
                .catch(reject);
        });
    }
    async getPerfTxs() {
        const perfTxsPromise = this.getData(rs_PerfTxStoreName);
        console.log('Retrieving PerfTxs');
        try {
            let perfTxs = await perfTxsPromise;
            perfTxs = perfTxs.filter((p) => this.getMaxDownloadDateDifference() >
                new Date().getTime() - new Date(p.timestamp).getTime());
            const result = perfTxs.reduce((acc, tx) => {
                if (tx.chainType !== undefined && tx.chainType !== null) {
                    const chainKey = tx.chainType;
                    if (!acc[chainKey]) {
                        acc[chainKey] = { chart: 0 };
                    }
                    acc[chainKey].chart += tx.amount ?? 0;
                }
                return acc;
            }, {});
            return Object.fromEntries(Object.values(ChainType).map((chain) => [chain, result[chain] || { chart: 0 }]));
        }
        catch (error) {
            console.error(error);
            return {};
        }
    }
    constructor(db, eventSender) {
        super(db);
        this.db = db;
        this.eventSender = eventSender;
    }
    getMaxDownloadDateDifference() {
        return 604800000;
    }
    getDataType() {
        return 'performance_chart';
    }
}
