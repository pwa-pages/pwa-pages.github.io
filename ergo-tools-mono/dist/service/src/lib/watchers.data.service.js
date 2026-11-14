import { signal } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { getActiveChainTypes, permitAddresses, getChainTypes, permitTriggerAddresses, chainTypeTokens, permitBulkAddresses, chainTypeWatcherIdentifier } from './chain.service';
import { Currency, rs_WatcherCollateralRSN, rs_WatcherCollateralERG, rs_PermitCost } from './constants';
import { WatchersStats, EventType } from './models';
export class WatchersDataService {
    isChainTypeActive(chainType) {
        return getActiveChainTypes().includes(chainType);
    }
    constructor(downloadService, priceService, eventSender) {
        this.downloadService = downloadService;
        this.priceService = priceService;
        this.eventSender = eventSender;
        this.rsnToken = '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';
        this.watchersStatsSignal = signal(new WatchersStats());
        this.watchersStats = new WatchersStats();
        this.busyCounter = 0;
    }
    getWatcherStats() {
        return this.watchersStatsSignal;
    }
    getWatchersInfo() {
        const result = this.downloadService.downloadBalance('SiDFfCzE1MKdUevq1vCRN1vA7ZWNQD3gPBXdGSJ3xxDbh6x1YHb9PRJgFM7kS9YUFNmP5giWuL9NLhsvhYLvvfwLQb8MZ3NM9yvLyYRixmVLnBS7QoiYSYj3ijuHVFnMtp538uGxXLfRF6bsaW68dbnjDuHMVtNccjHYgSTBiWNkWja8sDMSm635rvMeB61ARKpTQmR5Wf1T9NJnVutjazhX9nABq8L46d2jSYgtKVDiSv4cFZPZ4Y5S1fDDJYP2PLnKx3gRFqN89JWHhGWwh5SQgU73Dc2EbHQx3G39Ah6MSntJKc345LW6AnZjqqc2qg8xsNXtdxD6NcuWWnKnYrXABKPR6Tc7isRb4FoGxn7dWPaMDEhxCH2GsTNjM1CdYqdEEXauFkPiA2faRY6qDkVKdZ2G4wDdRcTUcyxK5KCciGi3UgCWpPxuXDp6b3YMBMqPan78xM2ttrDeS4ns1vq9rhPEyJG9Gj3m7epBMEXh6vdjLA5pCwnKMySyHNYviTv7nwCxG1A4bEzFNTxKqoJLHD1gUssBC2xrrkxj3ubgGz3YN6L5jVKmzce16XPVtqZfusiAC611kX34Hd4F9oCU');
        return result;
    }
    getPermitsInfo(chainType) {
        const address = permitAddresses[chainType];
        if (address == null) {
            return new Observable((subscriber) => {
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
        Object.values(Currency).forEach((currency) => {
            const conversions = [
                {
                    amount: rs_WatcherCollateralRSN('Ergo'),
                    from: 'RSN',
                    callback: (c) => (this.watchersStats.watchersAmountsPerCurrency[currency].rsnCollateral = c),
                },
                {
                    amount: rs_WatcherCollateralERG('Ergo'),
                    from: 'ERG',
                    callback: (c) => (this.watchersStats.watchersAmountsPerCurrency[currency].ergCollateral = c),
                },
                {
                    amount: rs_PermitCost,
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
                        rs_PermitCost * (this.watchersStats.totalPermitCount ?? 0),
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
        Object.values(Currency).forEach((currency) => {
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
            this.getValue(this.watchersStats.chainPermitCount, chainType, rs_PermitCost) +
                this.getValue(this.watchersStats.chainWatcherCount, chainType, rs_WatcherCollateralRSN(chainType));
        this.watchersStats.chainLockedERG[chainType] = this.getValue(this.watchersStats.chainWatcherCount, chainType, rs_WatcherCollateralERG(chainType));
        getChainTypes().forEach((c) => {
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
        Object.values(Currency).forEach((currency) => {
            this.watchersStats.watchersAmountsPerCurrency[currency].watcherValue = 0;
            this.watchersStats.watchersAmountsPerCurrency[currency].permitValue = 0;
        });
        this.convertCurrencies();
        this.updateTotalLocked();
        Object.values(Currency).forEach((currency) => {
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
                type: EventType.WatchersStatsChanged,
                data: this.watchersStats,
            });
        }
    }
    downloadPermitInfo(address, tokenId, tokenName) {
        return this.downloadService
            .downloadBalance(address)
            .pipe(map((data) => {
            if (data.tokens) {
                const tokenData = data.tokens.find((token) => (tokenId && token.tokenId === tokenId) ||
                    (tokenName && token.name === tokenName));
                if (tokenData) {
                    tokenData.amount /=
                        rs_PermitCost * Math.pow(10, tokenData.decimals);
                    tokenData.amount = Math.floor(tokenData.amount);
                }
            }
            return data;
        }))
            .pipe(map((result) => {
            return result.tokens.find((token) => (tokenId && token.tokenId === tokenId) ||
                (tokenName && token.name === tokenName));
        }));
    }
    getTriggerPermitsInfo(chainType) {
        const address = permitTriggerAddresses[chainType];
        if (address === null) {
            return new Observable((subscriber) => {
                subscriber.next(undefined);
                subscriber.complete();
            });
        }
        return this.downloadPermitInfo(address, null, chainTypeTokens[chainType]);
    }
    getBulkPermitsInfo(chainType) {
        const address = permitBulkAddresses[chainType];
        if (address === null) {
            return new Observable((subscriber) => {
                subscriber.next(undefined);
                subscriber.complete();
            });
        }
        return this.downloadPermitInfo(address, null, chainTypeTokens[chainType]);
    }
    async download() {
        getChainTypes().forEach((c) => {
            this.getTriggerPermitsInfo(c)
                .pipe(map((permitsInfo) => permitsInfo?.amount))
                .subscribe(async (amount) => {
                this.watchersStats.triggerPermitCount[c] = amount;
                await this.setLockedAmounts(c);
            });
            this.getBulkPermitsInfo(c)
                .pipe(map((permitsInfo) => permitsInfo?.amount))
                .subscribe(async (amount) => {
                this.watchersStats.bulkPermitCount[c] = amount;
                await this.setLockedAmounts(c);
            });
        });
        const watcherInfo$ = this.getWatchersInfo();
        watcherInfo$
            .pipe(map((watcherInfo) => {
            getChainTypes().forEach(async (c) => {
                const amount = watcherInfo.tokens.find((token) => token.name === chainTypeWatcherIdentifier[c])?.amount ?? 0;
                this.watchersStats.chainWatcherCount[c] = amount;
                await this.setLockedAmounts(c);
            });
        }))
            .subscribe();
        getChainTypes().forEach((c) => {
            this.getPermitsInfo(c)
                .pipe(map((permitsInfo) => permitsInfo?.amount))
                .subscribe(async (amount) => {
                this.watchersStats.chainPermitCount[c] = amount;
                await this.setLockedAmounts(c);
            });
        });
        return this.watchersStatsSignal;
    }
}
//# sourceMappingURL=watchers.data.service.js.map