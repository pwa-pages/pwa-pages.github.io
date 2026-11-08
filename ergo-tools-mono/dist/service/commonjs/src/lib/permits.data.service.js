"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWatcherDataService = exports.PermitsDataService = void 0;
const chain_service_1 = require("./chain.service");
const constants_1 = require("./constants");
const data_service_1 = require("./data.service");
const mywatcher_data_service_1 = require("./mywatcher.data.service");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class PermitsDataService extends data_service_1.DataService {
    storeName;
    maxDownloadDateDifference;
    getData() {
        return this.storageService.getData(this.storeName);
    }
    async getExistingData(transaction, address) {
        for (const input of transaction.inputs) {
            if (input.boxId) {
                const data = await this.storageService.getDataById(this.storeName, this.createUniqueId(input.boxId, transaction.id, address));
                if (data) {
                    return data;
                }
            }
        }
        for (const output of transaction.outputs) {
            if (output.boxId) {
                const data = await this.storageService.getDataById(this.storeName, this.createUniqueId(output.boxId, transaction.id, address));
                if (data) {
                    return data;
                }
            }
        }
        return null;
    }
    constructor(db, storeName = constants_1.rs_ActivePermitTxStoreName, maxDownloadDateDifference = 204800000) {
        super(db);
        this.storeName = storeName;
        this.maxDownloadDateDifference = maxDownloadDateDifference;
    }
    createUniqueId(boxId, transactionId, address) {
        const str = `${transactionId}_${boxId}_${address}`;
        let hash = 0, i, chr;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0;
        }
        return hash.toString();
    }
    createPermitTx(boxId, transactionId, transactionAddress, address, date, assets, chainType) {
        for (const [key, triggerAddress] of Object.entries(chain_service_1.permitTriggerAddresses)) {
            if (triggerAddress === address) {
                address = `trigger_address_${key}`;
                break;
            }
        }
        for (const [key, bulkAddress] of Object.entries(chain_service_1.permitBulkAddresses)) {
            if (bulkAddress === address) {
                address = `bulk_address_${key}`;
                break;
            }
        }
        for (const [key, rewardAddress] of Object.entries(chain_service_1.rewardAddresses)) {
            if (rewardAddress === address) {
                address = `reward_address_${key}`;
                break;
            }
        }
        return {
            id: this.createUniqueId(boxId, transactionId, transactionAddress),
            address,
            date,
            boxId,
            assets: assets || [],
            wid: '',
            chainType,
            transactionId,
        };
    }
    getDataType() {
        return 'activepermit';
    }
    getMaxDownloadDateDifference() {
        return this.maxDownloadDateDifference;
    }
    async getWatcherPermits() {
        const permitsPromise = this.storageService.getData(this.storeName);
        console.log('Retrieving watcher active permits');
        try {
            const permits = await permitsPromise;
            permits.forEach((permit) => {
                permit.assets = permit.assets
                    .filter((asset) => asset.tokenId != null && asset.tokenId in chain_service_1.rwtTokenIds)
                    .map((asset_1) => {
                    return asset_1;
                });
            });
            permits.sort((a, b) => b.date.getTime() - a.date.getTime());
            return await new Promise((resolve) => {
                resolve(permits);
            });
        }
        catch (error) {
            console.error(error);
            return [];
        }
    }
    async downloadOpenBoxes(chainType) {
        let addresses = [];
        Object.entries(chain_service_1.permitBulkAddresses).forEach(([key, address]) => {
            if (key === chainType && address != null) {
                addresses.push(address);
            }
        });
        const downloadPromises = addresses.map(async (address) => {
            let url = 'https://api.ergoplatform.com/api/v1/boxes/unspent/byAddress/' +
                address;
            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`Server returned code: ${response.status}`);
            await this.saveOpenBoxes(address, await response.json());
        });
        await Promise.all(downloadPromises);
    }
    async saveOpenBoxes(address, openBoxesJson) {
        const boxes = {
            address: address,
            openBoxesJson: openBoxesJson,
        };
        await this.storageService.addData(constants_1.rs_OpenBoxesStoreName, [boxes]);
    }
    async getOpenBoxesMap() {
        const openBoxesMap = {};
        const boxes = this.storageService.getData(constants_1.rs_OpenBoxesStoreName);
        for (const [chainType, address] of Object.entries(chain_service_1.permitBulkAddresses)) {
            if (address) {
                var json = (await boxes).filter(ob => ob.address === address);
                var key = "bulk_address_" + chainType;
                if (json.length != 0) {
                    openBoxesMap[key] = JSON.stringify(json);
                }
                else {
                    openBoxesMap[key] = null;
                }
            }
        }
        return openBoxesMap;
    }
    shouldAddInputToDb(address, assets, item) {
        if (Object.values(chain_service_1.permitTriggerAddresses).includes(address)) {
            return true;
        }
        if (address != null && address.length <= 100 && assets.length > 0) {
            if (item.outputs.some((output) => Object.values(chain_service_1.permitBulkAddresses).includes(output.address))) {
                return false;
            }
            return true;
        }
        return false;
    }
    shouldAddOutputToDb(address) {
        return (Object.values(chain_service_1.permitBulkAddresses).includes(address) ||
            Object.values(chain_service_1.permitTriggerAddresses).includes(address) ||
            Object.values(chain_service_1.rewardAddresses).includes(address));
    }
    async getAdressPermits(activeOnly, frommonth, fromyear, tomonth, toyear, addresses = null) {
        const permits = await this.getWatcherPermits();
        const openBoxesMap = await this.getOpenBoxesMap();
        let addressPermits = new Array();
        if (addresses != null && addresses.length > 0) {
            addressPermits = permits.filter((info) => addresses.some((addr) => addr === info.address));
        }
        if (activeOnly === false) {
            addressPermits = permits;
        }
        let result = new Array();
        const permitsByTxId = {};
        for (const permit of permits) {
            if (!permitsByTxId[permit.transactionId]) {
                permitsByTxId[permit.transactionId] = [];
            }
            permitsByTxId[permit.transactionId].push(permit);
        }
        const boxIdMap = {};
        for (const permit of permits) {
            if (!boxIdMap[permit.boxId]) {
                boxIdMap[permit.boxId] = [];
            }
            boxIdMap[permit.boxId].push(permit);
        }
        var permitBulkAddressSet = new Set(Object.values(chain_service_1.permitBulkAddresses));
        for (const permit of addressPermits) {
            if (permit.address.startsWith("trigger_address")) {
                continue;
            }
            let outputs = (permitsByTxId[permit.transactionId] ?? []).filter((o) => Object.values(chain_service_1.permitTriggerAddresses).some((address) => address === o.address || o.address.startsWith("trigger_address")));
            let foundResolved = false;
            for (const output of outputs) {
                let cnt = boxIdMap[output.boxId] ?? [];
                if (cnt.length >= 2) {
                    foundResolved = true;
                    if (activeOnly) {
                        for (const p of cnt) {
                            let txs = permitsByTxId[p.transactionId]?.filter((t) => permitBulkAddressSet.has(t.address) || t.address.startsWith("bulk_address_")) ?? [];
                            txs.map(async (t) => {
                                let openBoxes = openBoxesMap[t.address];
                                if (openBoxes && openBoxes.indexOf(t.boxId) !== -1) {
                                    if (!result.some((r) => r.boxId === t.boxId)) {
                                        result.push(permit);
                                    }
                                }
                            });
                        }
                    }
                    else {
                        for (const p of cnt) {
                            let txs = permitsByTxId[p.transactionId]?.filter((t) => permitBulkAddressSet.has(t.address) || t.address.startsWith("bulk_address_")) ?? [];
                            txs.map(t => {
                                const d0 = new Date(t.date);
                                if (frommonth != null && fromyear != null && tomonth != null && toyear != null) {
                                    if ((d0.getFullYear() > fromyear || (d0.getMonth() + 1 >= frommonth && d0.getFullYear() == fromyear))
                                        &&
                                            (d0.getFullYear() < toyear || (d0.getMonth() + 1 <= tomonth && d0.getFullYear() == toyear))) {
                                        result.push(permit);
                                    }
                                }
                                else {
                                    result.push(permit);
                                }
                            });
                        }
                    }
                }
            }
            if (foundResolved === false) {
                result.push(permit);
            }
        }
        const seen = new Set();
        const filteredResult = result.filter((r) => {
            const key = `${r.transactionId}:${r.address}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
        return filteredResult;
    }
    async addData(address, transactions) {
        const tempData = [];
        const now = Date.now();
        let maxDiff = this.getMaxDownloadDateDifference();
        transactions.forEach((item) => {
            item.inputs.forEach((input) => {
                if (this.shouldAddInputToDb(input.address, input.assets, item) === false) {
                    return;
                }
                input.inputDate = new Date(item.timestamp);
                input.assets = input.assets.filter((a) => a.tokenId != null && a.tokenId in chain_service_1.rwtTokenIds);
                const permitTx = this.createPermitTx(input.boxId, item.id, address, input.address, input.inputDate, input.assets, (0, chain_service_1.getChainTypeForPermitTriggerAddress)(address));
                if (permitTx != null && permitTx.date && now - new Date(permitTx.date).getTime() <= maxDiff * 2) {
                    tempData.push(permitTx);
                }
            });
            item.outputs.forEach((output) => {
                if (this.shouldAddOutputToDb(output.address) === false) {
                    return;
                }
                output.outputDate = new Date(item.timestamp);
                output.assets = output.assets.filter((a) => a.tokenId != null && a.tokenId in chain_service_1.rwtTokenIds);
                output.assets.forEach((a) => {
                    a.amount = -a.amount;
                });
                const permitTx = this.createPermitTx(output.boxId, item.id, address, output.address, output.outputDate, output.assets, (0, chain_service_1.getChainTypeForPermitAddress)(address));
                if (permitTx != null && permitTx.date && now - new Date(permitTx.date).getTime() <= maxDiff * 2) {
                    tempData.push(permitTx);
                }
            });
        });
        await this.storageService.addData(this.storeName, tempData);
    }
    async purgeData() {
        let permitTxs = await this.storageService.getData(this.storeName);
        permitTxs = (await permitTxs).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let permitTx = null;
        if (permitTxs.length >= constants_1.rs_FullDownloadsBatchSize) {
            permitTx = permitTxs[constants_1.rs_FullDownloadsBatchSize - 1];
        }
        else {
            permitTx = permitTxs[permitTxs.length - 1];
        }
        let maxDiff = this.getMaxDownloadDateDifference();
        const now = Date.now();
        if (permitTx != null && now - permitTx.date.getTime() > maxDiff) {
            maxDiff = now - permitTx.date.getTime();
        }
        var purgePermitTxs = [];
        for (const permitTx of permitTxs) {
            if (permitTx.date &&
                now - new Date(permitTx.date).getTime() > maxDiff) {
                purgePermitTxs.push(permitTx);
            }
        }
        await this.storageService.deleteData(this.storeName, purgePermitTxs.map(pt => pt.id));
    }
    async getSortedPermits() {
        const permitsPromise = await this.getWatcherPermits();
        const sortedPermits = [];
        console.log('start retrieving permits from database');
        try {
            const permits = await permitsPromise;
            permits.forEach((permitTx) => {
                sortedPermits.push({
                    id: permitTx.id,
                    date: permitTx.date,
                    address: permitTx.address,
                    assets: permitTx.assets,
                    wid: permitTx.wid,
                    boxId: permitTx.boxId,
                    transactionId: permitTx.transactionId,
                    chainType: permitTx.chainType ??
                        (0, chain_service_1.getChainTypeForPermitAddress)(permitTx.address),
                });
            });
            console.log('done retrieving permits from database ' + permits.length + ' permits');
            return await new Promise((resolve) => {
                resolve(sortedPermits);
            });
        }
        catch (error) {
            console.error(error);
            return sortedPermits;
        }
    }
}
exports.PermitsDataService = PermitsDataService;
const GetWatcherDataService = (permitsDataService) => {
    return new mywatcher_data_service_1.MyWatcherDataService(permitsDataService);
};
exports.GetWatcherDataService = GetWatcherDataService;
