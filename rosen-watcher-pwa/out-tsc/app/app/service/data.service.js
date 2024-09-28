import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { Input } from '../../models/input';
let DataService = class DataService {
    constructor(storageService, chainService) {
        this.storageService = storageService;
        this.chainService = chainService;
        this.initialNDownloads = 50;
        this.fullDownloadsBatchSize = 200;
        this.busyCounter = 0;
    }
    async getWatcherInputs() {
        const inputsPromise = this.storageService.getInputs();
        try {
            const inputs = await inputsPromise;
            const result_1 = inputs
                .filter((i) => this.chainService.getChainType(i.address) != null)
                .sort((a, b) => b.outputCreatedAt - a.outputCreatedAt);
            result_1.forEach((input) => {
                input.assets = input.assets
                    .filter((asset) => asset.name === 'RSN' || asset.name === 'eRSN')
                    .map((asset_1) => {
                    return asset_1;
                });
            });
            return await new Promise((resolve) => {
                resolve(result_1);
            });
        }
        catch (error) {
            console.error(error);
            return [];
        }
    }
    async getInputs() {
        return this.storageService.getInputs();
    }
    async getTotalRewards(inputs) {
        try {
            const sum = inputs.reduce((accumulator, o) => {
                let assetAmount = 0;
                o.assets.forEach((asset) => {
                    assetAmount += asset.amount / Math.pow(10, asset.decimals);
                });
                return accumulator + assetAmount;
            }, 0);
            return await new Promise((resolve) => {
                resolve(sum.toFixed(3));
            });
        }
        catch (error) {
            console.error(error);
            return '';
        }
    }
    async getSortedInputs() {
        const inputsPromise = this.getWatcherInputs();
        let amount = 0;
        const sortedInputs = [];
        console.log('start retrieving chart from database');
        try {
            const inputs = await inputsPromise;
            inputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());
            inputs.forEach((input) => {
                input.assets.forEach((asset) => {
                    amount += asset.amount;
                    sortedInputs.push(new Input(input.inputDate, input.address, input.outputCreatedAt, input.assets, input.outputAddress, input.boxId, amount, asset.amount / Math.pow(10, asset.decimals), this.chainService.getChainType(input.address)));
                });
            });
            console.log('done retrieving chart from database ' + inputs.length + ' inputs');
            return await new Promise((resolve) => {
                resolve(sortedInputs);
            });
        }
        catch (error) {
            console.error(error);
            return sortedInputs;
        }
    }
    async getAddresses() {
        return await this.storageService.getAddressData();
    }
    async getAddressesForDisplay(inputs) {
        const addresses = this.getAddressesFromInputs(inputs);
        return addresses.then((addresses) => {
            const result = [];
            addresses.forEach((a) => {
                result.push({
                    address: a.address.substring(0, 6) + '...',
                    chainType: a.chainType,
                });
            });
            result.sort((a, b) => (a.chainType != null ? a.chainType : '').localeCompare(b.chainType != null ? b.chainType : ''));
            return result;
        });
    }
    async getAddressesFromInputs(inputs) {
        const addresses = [];
        try {
            inputs.forEach((input) => {
                if (!addresses.some((address) => address.address == input.outputAddress)) {
                    addresses.push({
                        address: input.outputAddress,
                        chainType: this.chainService.getChainType(input.address),
                    });
                }
            });
            return await new Promise((resolve) => {
                resolve(addresses);
            });
        }
        catch (error) {
            console.error(error);
            return addresses;
        }
    }
};
DataService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], DataService);
export { DataService };
//# sourceMappingURL=data.service.js.map