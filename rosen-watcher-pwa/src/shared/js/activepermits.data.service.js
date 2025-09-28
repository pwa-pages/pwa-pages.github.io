// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ActivePermitsDataService extends DataService {
    db;
    async getExistingData(transaction, address) {
        for (const input of transaction.inputs) {
            if (input.boxId) {
                const data = await this.getDataById(this.createUniqueId(input.boxId, transaction.id, address), this.db);
                if (data) {
                    return data;
                }
            }
        }
        for (const output of transaction.outputs) {
            if (output.boxId) {
                const data = await this.getDataById(this.createUniqueId(output.boxId, transaction.id, address), this.db);
                if (data) {
                    return data;
                }
            }
        }
        return null;
    }
    constructor(db) {
        super(db);
        this.db = db;
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
    getDataType() {
        return 'activepermit';
    }
    getMaxDownloadDateDifference() {
        return 204800000;
    }
    async getWatcherPermits() {
        const permitsPromise = this.getData(rs_ActivePermitTxStoreName);
        console.log('Retrieving watcher active permits');
        try {
            const permits = await permitsPromise;
            permits.forEach((permit) => {
                permit.assets = permit.assets
                    .filter((asset) => asset.tokenId != null && asset.tokenId in rwtTokenIds)
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
        Object.entries(permitBulkAddresses).forEach(([key, address]) => {
            if (key === chainType && address != null) {
                addresses.push(address);
            }
        });
        const downloadPromises = addresses.map(async (address) => {
            let url = 'https://api.ergoplatform.com/api/v1/boxes/unspent/byAddress/' + address;
            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`Server returned code: ${response.status}`);
            await this.saveOpenBoxes(address, await response.json(), this.db);
        });
        await Promise.all(downloadPromises);
    }
    async saveOpenBoxes(address, openBoxesJson, db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([rs_OpenBoxesStoreName], 'readwrite');
            const objectStore = transaction.objectStore(rs_OpenBoxesStoreName);
            const boxes = { address: address, openBoxesJson: openBoxesJson };
            const request = objectStore.put(boxes);
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }
    async getOpenBoxesMap(db) {
        const openBoxesMap = {};
        const transaction = db.transaction([rs_OpenBoxesStoreName], 'readonly');
        const objectStore = transaction.objectStore(rs_OpenBoxesStoreName);
        for (const [, address] of Object.entries(permitBulkAddresses)) {
            if (address) {
                openBoxesMap[address] = await new Promise((resolve, reject) => {
                    const request = objectStore.get(address);
                    request.onsuccess = () => {
                        const result = request.result;
                        resolve(result ?? null);
                    };
                    request.onerror = (event) => reject(event.target.error);
                });
            }
        }
        return openBoxesMap;
    }
    shouldAddInputToDb(address) {
        return ((address != null && address.length <= 100) ||
            Object.values(permitTriggerAddresses).includes(address));
    }
    shouldAddOutputToDb(address) {
        return (Object.values(permitBulkAddresses).includes(address) ||
            Object.values(permitTriggerAddresses).includes(address) ||
            Object.values(rewardAddresses).includes(address));
    }
    async getAdressActivePermits() {
        const permits = await this.getWatcherPermits();
        const addresses = await this.getData(rs_AddressDataStoreName);
        const openBoxesMap = await this.getOpenBoxesMap(this.db);
        let resolvedBulkPermits = permits.filter((info) => Object.values(permitBulkAddresses).some((address) => address === info.address));
        console.log('Resolved active permits:', resolvedBulkPermits);
        let addressPermits = permits.filter((info) => addresses.some((addr) => addr.address === info.address));
        let result = new Array();
        for (const permit of addressPermits) {
            let outputs = permits.filter((o) => o.transactionId === permit.transactionId &&
                Object.values(permitTriggerAddresses).some((address) => address === o.address));
            let foundResolved = false;
            for (const output of outputs) {
                let cnt = permits.filter((p) => p.boxId === output.boxId);
                if (cnt.length >= 2) {
                    foundResolved = true;
                    for (const p of cnt) {
                        let txs = permits.filter((t) => t.transactionId === p.transactionId &&
                            Object.values(permitBulkAddresses).includes(t.address));
                        await Promise.all(txs.map(async (t) => {
                            let openBoxes = openBoxesMap[t.address];
                            if (openBoxes && JSON.stringify(openBoxes.openBoxesJson).indexOf(t.boxId) !== -1) {
                                if (!result.some((r) => r.boxId === t.boxId)) {
                                    result.push(permit);
                                }
                            }
                        }));
                    }
                }
            }
            if (foundResolved === false) {
                result.push(permit);
            }
        }
        return result;
    }
    async addData(address, transactions, db) {
        return new Promise((resolve, reject) => {
            // Create a temporary array to hold PermitTx items before bulk insertion
            const tempData = [];
            transactions.forEach((item) => {
                item.inputs.forEach((input) => {
                    if (this.shouldAddInputToDb(input.address) === false) {
                        return;
                    }
                    input.inputDate = new Date(item.timestamp);
                    input.assets = input.assets.filter((a) => a.tokenId != null && a.tokenId in rwtTokenIds);
                    const PermitTx = {
                        id: this.createUniqueId(input.boxId, item.id, address),
                        address: input.address,
                        date: input.inputDate,
                        boxId: input.boxId,
                        assets: input.assets || [],
                        wid: '',
                        chainType: getChainTypeForPermitAddress(address),
                        transactionId: item.id,
                    };
                    tempData.push(PermitTx);
                });
                item.outputs.forEach((output) => {
                    if (this.shouldAddOutputToDb(output.address) === false) {
                        return;
                    }
                    output.outputDate = new Date(item.timestamp);
                    output.assets = output.assets.filter((a) => a.tokenId != null && a.tokenId in rwtTokenIds);
                    output.assets.forEach((a) => {
                        a.amount = -a.amount;
                    });
                    const PermitTx = {
                        id: this.createUniqueId(output.boxId, item.id, address),
                        address: output.address,
                        date: output.outputDate,
                        boxId: output.boxId,
                        assets: output.assets || [],
                        wid: '',
                        chainType: getChainTypeForPermitAddress(address),
                        transactionId: item.id,
                    };
                    tempData.push(PermitTx);
                });
            });
            const transaction = db.transaction([rs_ActivePermitTxStoreName], 'readwrite');
            const objectStore = transaction.objectStore(rs_ActivePermitTxStoreName);
            const putPromises = tempData.map((PermitTx) => {
                return new Promise((putResolve, putReject) => {
                    const request = objectStore.put(PermitTx);
                    request.onsuccess = () => putResolve();
                    request.onerror = (event) => putReject(event.target.error);
                });
            });
            Promise.all(putPromises)
                .then(async () => {
                resolve();
            })
                .catch(reject);
        });
    }
    async purgeData(db) {
        let permitTxs = await this.getData(rs_ActivePermitTxStoreName);
        permitTxs = (await permitTxs).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let permitTx = null;
        if (permitTxs.length >= rs_FullDownloadsBatchSize) {
            permitTx = permitTxs[rs_FullDownloadsBatchSize - 1];
        }
        else {
            permitTx = permitTxs[permitTxs.length - 1];
        }
        let maxDiff = this.getMaxDownloadDateDifference();
        const now = Date.now();
        if (permitTx != null && now - permitTx.date.getMilliseconds() > maxDiff) {
            maxDiff = now - permitTx.date.getTime();
        }
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([rs_ActivePermitTxStoreName], 'readwrite');
            const objectStore = transaction.objectStore(rs_ActivePermitTxStoreName);
            const request = objectStore.openCursor();
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const permitTx = cursor.value;
                    if (permitTx.date && now - new Date(permitTx.date).getTime() > maxDiff) {
                        cursor.delete();
                    }
                    cursor.continue();
                }
                else {
                    resolve();
                }
            };
            request.onerror = (event) => reject(event.target.error);
        });
    }
    // Get Data by BoxId from IndexedDB
    async getDataById(id, db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([rs_ActivePermitTxStoreName], 'readonly');
            const objectStore = transaction.objectStore(rs_ActivePermitTxStoreName);
            const request = objectStore.get(id);
            request.onsuccess = () => {
                const result = request.result;
                if (!result || result.id !== id) {
                    resolve(null);
                }
                else {
                    resolve(result);
                }
            };
            request.onerror = (event) => reject(event.target.error);
        });
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
                    chainType: permitTx.chainType ?? getChainTypeForPermitAddress(permitTx.address),
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
