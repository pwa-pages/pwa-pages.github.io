// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MyWatcherDataService extends DataService {
    db;
    eventSender;
    activePermitsDataService;
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
    constructor(db, eventSender, activePermitsDataService) {
        super(db);
        this.db = db;
        this.eventSender = eventSender;
        this.activePermitsDataService = activePermitsDataService;
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
        return 'permit';
    }
    async getWatcherPermits() {
        const permitsPromise = this.getData(rs_PermitTxStoreName);
        console.log('Retrieving watcher permits and such');
        try {
            const permits = await permitsPromise;
            permits.forEach((permit) => {
                permit.assets = permit.assets
                    .filter((asset) => asset.name == 'RSN')
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
    shouldAddToDb(address, assets) {
        return (address != null &&
            address.length > 0 &&
            address.length <= 100 &&
            assets.some((asset) => asset.name === 'RSN'));
    }
    async getAdressPermits() {
        const permits = await this.getWatcherPermits();
        const widSums = {};
        const permitInfo = [];
        for (const permit of permits) {
            const sum = permit.assets.reduce((acc, asset) => {
                if (asset.name === 'RSN') {
                    return acc + asset.amount / Math.pow(10, asset.decimals);
                }
                return acc;
            }, 0);
            if (widSums[permit.wid]) {
                widSums[permit.wid] += sum;
            }
            else {
                widSums[permit.wid] = sum;
            }
        }
        for (const permit of permits) {
            if (!permitInfo.some((p) => p.address == permit.address)) {
                permitInfo.push({
                    address: permit.address,
                    wid: permit.wid,
                    lockedRSN: widSums[permit.wid] || 0,
                    activeLockedRSN: 0,
                    chainType: permit.chainType,
                });
            }
        }
        const addresses = await this.getData(rs_AddressDataStoreName);
        console.log(this.activePermitsDataService);
        /*
        let addressActivePermits = await this.activePermitsDataService.getAdressActivePermits();
    
        for (const activePermit of addressActivePermits) {
          const info = permitInfo.find((p) => p.address === activePermit.address);
          if (info) {
            info.activeLockedRSN += rs_PermitCost;
          }
        }
          */
        return permitInfo.filter((info) => addresses.some((addr) => addr.address === info.address));
    }
    async addData(address, transactions, db) {
        return new Promise((resolve, reject) => {
            // Create a temporary array to hold PermitTx items before bulk insertion
            const tempData = [];
            transactions.forEach((item) => {
                let iwids = item.inputs
                    .flatMap((input) => input.assets)
                    .filter((asset) => asset.name.startsWith('WID-'))
                    .flatMap((a) => a.name);
                let owids = item.outputs
                    .flatMap((output) => output.assets)
                    .filter((asset) => asset.name.startsWith('WID-'))
                    .flatMap((a) => a.name);
                const allWids = Array.from(new Set([...iwids, ...owids]));
                item.inputs.forEach((input) => {
                    if (this.shouldAddToDb(input.address, input.assets) === false) {
                        return;
                    }
                    input.inputDate = new Date(item.timestamp);
                    input.assets = input.assets.filter((a) => a.name == 'RSN' || a.name.startsWith('WID-'));
                    input.assets.forEach((a) => {
                        a.tokenId = null;
                    });
                    let wid;
                    for (wid of allWids) {
                        const PermitTx = {
                            id: this.createUniqueId(input.boxId, item.id, address),
                            address: input.address,
                            date: input.inputDate,
                            boxId: input.boxId,
                            assets: input.assets || [],
                            wid: wid ?? '',
                            chainType: getChainTypeForPermitAddress(address),
                            transactionId: item.id,
                        };
                        if (PermitTx.assets.length > 0) {
                            tempData.push(PermitTx);
                        }
                    }
                });
                item.outputs.forEach((output) => {
                    if (this.shouldAddToDb(output.address, output.assets) === false) {
                        return;
                    }
                    output.outputDate = new Date(item.timestamp);
                    output.assets = output.assets.filter((a) => a.name == 'RSN' || a.name.startsWith('WID-'));
                    output.assets.forEach((a) => {
                        a.tokenId = null;
                        a.amount = -a.amount;
                    });
                    let wid;
                    for (wid of allWids) {
                        const PermitTx = {
                            id: this.createUniqueId(output.boxId, item.id, address),
                            address: output.address,
                            date: output.outputDate,
                            boxId: output.boxId,
                            assets: output.assets || [],
                            wid: wid ?? '',
                            chainType: getChainTypeForPermitAddress(address),
                            transactionId: item.id,
                        };
                        if (PermitTx.assets.length > 0) {
                            tempData.push(PermitTx);
                        }
                    }
                });
            });
            const transaction = db.transaction([rs_PermitTxStoreName], 'readwrite');
            const objectStore = transaction.objectStore(rs_PermitTxStoreName);
            const putPromises = tempData.map((PermitTx) => {
                return new Promise((putResolve, putReject) => {
                    const request = objectStore.put(PermitTx);
                    request.onsuccess = () => putResolve();
                    request.onerror = (event) => putReject(event.target.error);
                });
            });
            Promise.all(putPromises)
                .then(async () => {
                const permits = await this.getAdressPermits();
                this.eventSender.sendEvent({
                    type: 'PermitsChanged',
                    data: permits,
                });
                resolve();
            })
                .catch(reject);
        });
    }
    // Get Data by BoxId from IndexedDB
    async getDataById(id, db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([rs_PermitTxStoreName], 'readonly');
            const objectStore = transaction.objectStore(rs_PermitTxStoreName);
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
                    chainType: permitTx.chainType ?? getChainTypeForPermitAddress(permitTx.address),
                    transactionId: permitTx.transactionId,
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
