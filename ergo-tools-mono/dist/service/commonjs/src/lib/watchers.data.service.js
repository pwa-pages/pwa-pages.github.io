"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchersDataService = void 0;
const core_1 = require("@angular/core");
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
const chain_service_1 = require("./chain.service");
const constants_1 = require("./constants");
const models_1 = require("./models");
class WatchersDataService {
    downloadService;
    priceService;
    eventSender;
    isChainTypeActive(chainType) {
        return (0, chain_service_1.getActiveChainTypes)().includes(chainType);
    }
    rsnToken = '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';
    watchersStatsSignal = (0, core_1.signal)(new models_1.WatchersStats());
    watchersStats = new models_1.WatchersStats();
    busyCounter = 0;
    constructor(downloadService, priceService, eventSender) {
        this.downloadService = downloadService;
        this.priceService = priceService;
        this.eventSender = eventSender;
    }
    getWatcherStats() {
        return this.watchersStatsSignal;
    }
    getWatchersInfo() {
        const result = this.downloadService.downloadBalance('SiDFfCzE1MKdUevq1vCRN1vA7ZWNQD3gPBXdGSJ3xxDbh6x1YHb9PRJgFM7kS9YUFNmP5giWuL9NLhsvhYLvvfwLQb8MZ3NM9yvLyYRixmVLnBS7QoiYSYj3ijuHVFnMtp538uGxXLfRF6bsaW68dbnjDuHMVtNccjHYgSTBiWNkWja8sDMSm635rvMeB61ARKpTQmR5Wf1T9NJnVutjazhX9nABq8L46d2jSYgtKVDiSv4cFZPZ4Y5S1fDDJYP2PLnKx3gRFqN89JWHhGWwh5SQgU73Dc2EbHQx3G39Ah6MSntJKc345LW6AnZjqqc2qg8xsNXtdxD6NcuWWnKnYrXABKPR6Tc7isRb4FoGxn7dWPaMDEhxCH2GsTNjM1CdYqdEEXauFkPiA2faRY6qDkVKdZ2G4wDdRcTUcyxK5KCciGi3UgCWpPxuXDp6b3YMBMqPan78xM2ttrDeS4ns1vq9rhPEyJG9Gj3m7epBMEXh6vdjLA5pCwnKMySyHNYviTv7nwCxG1A4bEzFNTxKqoJLHD1gUssBC2xrrkxj3ubgGz3YN6L5jVKmzce16XPVtqZfusiAC611kX34Hd4F9oCU');
        return result;
    }
    getPermitsInfo(chainType) {
        const address = chain_service_1.permitAddresses[chainType];
        if (address == null) {
            return new rxjs_1.Observable((subscriber) => {
                subscriber.next(undefined);
                subscriber.complete();
            });
        }
        return this.downloadPermitInfo(address, this.rsnToken, null);
    }
    updateTotal(map) {
        return Object.values(map).reduce((acc, val) => (acc ?? 0) + (val ?? 0), 0);
    }
    convertCurrencies() {
        Object.values(constants_1.Currency).forEach((currency) => {
            const conversions = [
                {
                    amount: (0, constants_1.rs_WatcherCollateralRSN)('Ergo'),
                    from: 'RSN',
                    callback: (c) => (this.watchersStats.watchersAmountsPerCurrency[currency].rsnCollateral = c),
                },
                {
                    amount: (0, constants_1.rs_WatcherCollateralERG)('Ergo'),
                    from: 'ERG',
                    callback: (c) => (this.watchersStats.watchersAmountsPerCurrency[currency].ergCollateral = c),
                },
                {
                    amount: constants_1.rs_PermitCost,
                    from: 'RSN',
                    callback: (c) => (this.watchersStats.watchersAmountsPerCurrency[currency].permitValue = c),
                },
                {
                    amount: this.watchersStats.totalLockedERG ?? 0,
                    from: 'ERG',
                    callback: (l) => (this.watchersStats.watchersAmountsPerCurrency[currency].totalLockedERG = l),
                },
                {
                    amount: (this.watchersStats.totalLockedRSN ?? 0) +
                        constants_1.rs_PermitCost * (this.watchersStats.totalPermitCount ?? 0),
                    from: 'RSN',
                    callback: (l) => (this.watchersStats.watchersAmountsPerCurrency[currency].totalLockedRSN = l),
                },
            ];
            conversions.forEach(({ amount, from, callback }) => {
                this.priceService
                    .convert(amount, from, currency ?? '')
                    .subscribe(callback);
            });
        });
    }
    updateTotalLocked() {
        Object.values(constants_1.Currency).forEach((currency) => {
            this.watchersStats.watchersAmountsPerCurrency[currency].totalLocked =
                (this.watchersStats.watchersAmountsPerCurrency[currency]
                    .totalLockedERG ?? 0) +
                    (this.watchersStats.watchersAmountsPerCurrency[currency]
                        .totalLockedRSN ?? 0);
        });
    }
    getValue(map, chainType, multiplier) {
        return (map[chainType] ?? 0) * multiplier;
    }
    async setLockedAmounts(chainType) {
        this.watchersStats.chainLockedRSN[chainType] =
            this.getValue(this.watchersStats.chainPermitCount, chainType, constants_1.rs_PermitCost) +
                this.getValue(this.watchersStats.chainWatcherCount, chainType, (0, constants_1.rs_WatcherCollateralRSN)(chainType));
        this.watchersStats.chainLockedERG[chainType] = this.getValue(this.watchersStats.chainWatcherCount, chainType, (0, constants_1.rs_WatcherCollateralERG)(chainType));
        (0, chain_service_1.getChainTypes)().forEach((c) => {
            this.watchersStats.activePermitCount[c] =
                (this.watchersStats.bulkPermitCount[c] ?? 0) +
                    (this.watchersStats.triggerPermitCount[c] ?? 0);
        });
        this.watchersStats.totalWatcherCount = this.updateTotal(this.watchersStats.chainWatcherCount);
        this.watchersStats.totalPermitCount = this.updateTotal(this.watchersStats.chainPermitCount);
        this.watchersStats.totalActivePermitCount = this.updateTotal(this.watchersStats.activePermitCount);
        this.watchersStats.totalLockedRSN = this.updateTotal(this.watchersStats.chainLockedRSN);
        this.watchersStats.totalLockedERG = this.updateTotal(this.watchersStats.chainLockedERG);
        await this.currencyUpdate();
    }
    async currencyUpdate() {
        Object.values(constants_1.Currency).forEach((currency) => {
            this.watchersStats.watchersAmountsPerCurrency[currency].watcherValue = 0;
            this.watchersStats.watchersAmountsPerCurrency[currency].permitValue = 0;
        });
        this.convertCurrencies();
        this.updateTotalLocked();
        Object.values(constants_1.Currency).forEach((currency) => {
            this.watchersStats.watchersAmountsPerCurrency[currency].watcherValue =
                (this.watchersStats.watchersAmountsPerCurrency[currency]
                    .rsnCollateral ?? 0) +
                    (this.watchersStats.watchersAmountsPerCurrency[currency]
                        .ergCollateral ?? 0);
        });
        const newStats = JSON.stringify(this.watchersStats);
        if (JSON.stringify(this.watchersStatsSignal()) !== newStats) {
            console.log('Settings watchers stats signal');
            this.watchersStatsSignal.set(JSON.parse(newStats));
            await this.eventSender?.sendEvent({
                type: models_1.EventType.WatchersStatsChanged,
                data: this.watchersStats,
            });
        }
    }
    downloadPermitInfo(address, tokenId, tokenName) {
        return this.downloadService
            .downloadBalance(address)
            .pipe((0, operators_1.map)((data) => {
            if (data.tokens) {
                const tokenData = data.tokens.find((token) => (tokenId && token.tokenId === tokenId) ||
                    (tokenName && token.name === tokenName));
                if (tokenData) {
                    tokenData.amount /=
                        constants_1.rs_PermitCost * Math.pow(10, tokenData.decimals);
                    tokenData.amount = Math.floor(tokenData.amount);
                }
            }
            return data;
        }))
            .pipe((0, operators_1.map)((result) => {
            return result.tokens.find((token) => (tokenId && token.tokenId === tokenId) ||
                (tokenName && token.name === tokenName));
        }));
    }
    getTriggerPermitsInfo(chainType) {
        const address = chain_service_1.permitTriggerAddresses[chainType];
        if (address === null) {
            return new rxjs_1.Observable((subscriber) => {
                subscriber.next(undefined);
                subscriber.complete();
            });
        }
        return this.downloadPermitInfo(address, null, chain_service_1.chainTypeTokens[chainType]);
    }
    getBulkPermitsInfo(chainType) {
        const address = chain_service_1.permitBulkAddresses[chainType];
        if (address === null) {
            return new rxjs_1.Observable((subscriber) => {
                subscriber.next(undefined);
                subscriber.complete();
            });
        }
        return this.downloadPermitInfo(address, null, chain_service_1.chainTypeTokens[chainType]);
    }
    async download() {
        (0, chain_service_1.getChainTypes)().forEach((c) => {
            this.getTriggerPermitsInfo(c)
                .pipe((0, operators_1.map)((permitsInfo) => permitsInfo?.amount))
                .subscribe(async (amount) => {
                this.watchersStats.triggerPermitCount[c] = amount;
                await this.setLockedAmounts(c);
            });
            this.getBulkPermitsInfo(c)
                .pipe((0, operators_1.map)((permitsInfo) => permitsInfo?.amount))
                .subscribe(async (amount) => {
                this.watchersStats.bulkPermitCount[c] = amount;
                await this.setLockedAmounts(c);
            });
        });
        const watcherInfo$ = this.getWatchersInfo();
        watcherInfo$
            .pipe((0, operators_1.map)((watcherInfo) => {
            (0, chain_service_1.getChainTypes)().forEach(async (c) => {
                const amount = watcherInfo.tokens.find((token) => token.name === chain_service_1.chainTypeWatcherIdentifier[c])?.amount ?? 0;
                this.watchersStats.chainWatcherCount[c] = amount;
                await this.setLockedAmounts(c);
            });
        }))
            .subscribe();
        (0, chain_service_1.getChainTypes)().forEach((c) => {
            this.getPermitsInfo(c)
                .pipe((0, operators_1.map)((permitsInfo) => permitsInfo?.amount))
                .subscribe(async (amount) => {
                this.watchersStats.chainPermitCount[c] = amount;
                await this.setLockedAmounts(c);
            });
        });
        return this.watchersStatsSignal;
    }
}
exports.WatchersDataService = WatchersDataService;
