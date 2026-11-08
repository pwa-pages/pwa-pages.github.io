"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainPerformanceDataService = void 0;
const chain_service_1 = require("./chain.service");
const constants_1 = require("./constants");
const data_service_1 = require("./data.service");
const models_1 = require("./models");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ChainPerformanceDataService extends data_service_1.DataService {
    db;
    eventSender;
    getData() {
        return this.storageService.getData(constants_1.rs_PerfTxStoreName);
    }
    async getExistingData(transaction) {
        return await this.storageService.getDataById(constants_1.rs_PerfTxStoreName, transaction.id);
    }
    async addData(_address, transactions) {
        const tempData = [];
        transactions.forEach((item) => {
            const chainTokensCount = {};
            const eRSNTotal = item.outputs.reduce((total, output) => {
                output.assets.forEach((asset) => {
                    if (asset.tokenId != null && asset.tokenId in chain_service_1.rwtTokenIds) {
                        if (!chainTokensCount[asset.tokenId]) {
                            chainTokensCount[asset.tokenId] = 1;
                        }
                        else {
                            chainTokensCount[asset.tokenId]++;
                        }
                    }
                });
                const assets = output.assets.filter((a) => a.tokenId === constants_1.rs_eRSNTokenId &&
                    Object.values(chain_service_1.rewardAddresses).includes(output.address));
                return (total +
                    assets.reduce((acc, asset) => acc + asset.amount / Math.pow(10, constants_1.rs_RSNDecimals), 0));
            }, 0);
            const maxKey = Object.entries(chainTokensCount).reduce((max, [key, value]) => (value > chainTokensCount[max] ? key : max), Object.keys(chainTokensCount)[0]);
            const chainType = Object.entries(chain_service_1.rwtTokenIds).find(([key]) => key === maxKey)?.[1];
            console.log("amount of eRSN in transaction: " + eRSNTotal + " item id: " + item.id + " chain type: " + chainType);
            const dbPerfTx = {
                id: item.id,
                timestamp: item.timestamp,
                amount: eRSNTotal,
                chainType: chainType,
            };
            tempData.push(dbPerfTx);
        });
        await this.storageService.addData(constants_1.rs_PerfTxStoreName, tempData);
        const perfTxs = await this.getPerfTxs();
        this.eventSender?.sendEvent({
            type: models_1.EventType.PerfChartChanged,
            data: perfTxs,
        });
    }
    async getPerfTxs() {
        const perfTxsPromise = this.storageService.getData(constants_1.rs_PerfTxStoreName);
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
            return Object.fromEntries(Object.values(chain_service_1.ChainType).map((chain) => [
                chain,
                result[chain] || { chart: 0 },
            ]));
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
exports.ChainPerformanceDataService = ChainPerformanceDataService;
