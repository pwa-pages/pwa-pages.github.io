

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class PermitsDataService extends DataService<PermitTx> {
  override getData(): Promise<PermitTx[] | null> {
    return this.storageService.getData<PermitTx>(this.storeName);
  }
  override async getExistingData(
    transaction: TransactionItem,
    address: string,
  ): Promise<PermitTx | null> {

    for (const input of transaction.inputs) {
      if (input.boxId) {
        const data = await this.storageService.getDataById(
          this.storeName, this.createUniqueId(input.boxId, transaction.id, address)
        );
        if (data) {
          return data;
        }
      }
    }

    for (const output of transaction.outputs) {
      if (output.boxId) {
        const data = await this.storageService.getDataById(
          this.storeName, this.createUniqueId(output.boxId, transaction.id, address)
        );
        if (data) {
          return data;
        }
      }
    }

    return null;
  }
  constructor(db: IDBDatabase | IStorageService<PermitTx>, private storeName = rs_ActivePermitTxStoreName, private maxDownloadDateDifference: number = 204800000) {
    super(db);
  }
  createUniqueId(
    boxId: string,
    transactionId: string,
    address: string,
  ): string {
    const str = `${transactionId}_${boxId}_${address}`;
    let hash = 0,
      i,
      chr;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return hash.toString();
  }

  private createPermitTx(
    boxId: string,
    transactionId: string,
    transactionAddress: string,
    address: string,
    date: Date,
    assets: Asset[],
    chainType: ChainType,
  ): PermitTx {

  
    for (const [key, triggerAddress] of Object.entries(permitTriggerAddresses)) {
      if (triggerAddress === address) {
        address = `trigger_address_${key}`;
        break;
      }
    }  

    for (const [key, bulkAddress] of Object.entries(permitBulkAddresses)) {
      if (bulkAddress === address) {
        address = `bulk_address_${key}`;
        break;
      }
    }

    for (const [key, rewardAddress] of Object.entries(rewardAddresses)) {
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

  getDataType(): string {
    return 'activepermit';
  }

  override getMaxDownloadDateDifference(): number {
    return this.maxDownloadDateDifference;
  }

  private async getWatcherPermits(): Promise<PermitTx[]> {
    const permitsPromise = this.storageService.getData<PermitTx>(this.storeName);

    console.log('Retrieving watcher active permits');

    try {
      const permits = await permitsPromise;



      permits.forEach((permit: PermitTx) => {
        permit.assets = permit.assets
          .filter(
            (asset: Asset) =>
              asset.tokenId != null && asset.tokenId in rwtTokenIds,
          )
          .map((asset_1: Asset) => {
            return asset_1;
          });
      });
      permits.sort((a, b) => b.date.getTime() - a.date.getTime());

      return await new Promise<PermitTx[]>((resolve) => {
        resolve(permits);
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async downloadOpenBoxes(chainType: string) {
    let addresses: string[] = [];

    Object.entries(permitBulkAddresses).forEach(([key, address]) => {
      if (key === chainType && address != null) {
        addresses.push(address);
      }
    });

    const downloadPromises: Promise<void>[] = addresses.map(async (address) => {
      let url =
        'https://api.ergoplatform.com/api/v1/boxes/unspent/byAddress/' +
        address;

      const response: Response = await fetch(url);
      if (!response.ok)
        throw new Error(`Server returned code: ${response.status}`);

      await this.saveOpenBoxes(address, await response.json());
    });

    await Promise.all(downloadPromises);
  }

  async saveOpenBoxes(
    address: string,
    openBoxesJson: string
  ): Promise<void> {


    const boxes: OpenBoxes = {
      address: address,
      openBoxesJson: openBoxesJson,
    };

    await this.storageService.addData<unknown>(rs_OpenBoxesStoreName, [boxes] as unknown[]);
  }

  async getOpenBoxesMap(
  ): Promise<Record<string, string | null> | null> {
    const openBoxesMap: Record<string, string | null> = {};


    const boxes = this.storageService.getData<OpenBoxes>(rs_OpenBoxesStoreName);
    for (const [chainType, address] of Object.entries(permitBulkAddresses)) {
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

  shouldAddInputToDb(address: string, assets: Asset[], item: TransactionItem): boolean {

    if (Object.values(permitTriggerAddresses).includes(address)) {
      return true;
    }

    if (address != null && address.length <= 100 && assets.length > 0) {
      if (item.outputs.some((output: Output) => Object.values(permitBulkAddresses).includes(output.address))) { return false; }
      return true;
    }

    return false;
  }

  shouldAddOutputToDb(address: string): boolean {
    return (
      Object.values(permitBulkAddresses).includes(address) ||
      Object.values(permitTriggerAddresses).includes(address) ||
      Object.values(rewardAddresses).includes(address)
    );
  }

  public async getAdressPermits(
    activeOnly: boolean, frommonth: number | null, fromyear: number | null, tomonth: number | null, toyear: number | null, addresses: string[] | null = null,
  ): Promise<PermitTx[]> {
    const permits = await this.getWatcherPermits();


    const openBoxesMap = await this.getOpenBoxesMap();

    let addressPermits = new Array<PermitTx>();
    if (addresses != null && addresses.length > 0) {
      addressPermits = permits.filter((info) =>
        addresses.some((addr) => addr === info.address),
      );

    }
    if (activeOnly === false) {
      addressPermits = permits;
    }

    let result = new Array<PermitTx>();

    const permitsByTxId: Record<string, PermitTx[]> = {};
    for (const permit of permits) {
      if (!permitsByTxId[permit.transactionId]) {
        permitsByTxId[permit.transactionId] = [];
      }
      permitsByTxId[permit.transactionId].push(permit);
    }

    const boxIdMap: Record<string, PermitTx[]> = {};
    for (const permit of permits) {
      if (!boxIdMap[permit.boxId]) {
        boxIdMap[permit.boxId] = [];
      }
      boxIdMap[permit.boxId].push(permit);
    }

    var permitBulkAddressSet = new Set(Object.values(permitBulkAddresses));
    for (const permit of addressPermits) {

      if(permit.address.startsWith("trigger_address")) {
        continue;
      }

      let outputs = (permitsByTxId[permit.transactionId] ?? []).filter((o) =>
        Object.values(permitTriggerAddresses).some(
          (address) => address === o.address || o.address.startsWith("trigger_address"),
        ),
      );
      let foundResolved = false;
  
      for (const output of outputs) {
        let cnt = boxIdMap[output.boxId] ?? [];
        
        if (cnt.length >= 2) {
          foundResolved = true;

          if (activeOnly) {
            for (const p of cnt) {
              let txs =
                permitsByTxId[p.transactionId]?.filter((t) =>
                  permitBulkAddressSet.has(t.address) || t.address.startsWith("bulk_address_"),
                ) ?? [];

              txs.map(async (t) => {
                let openBoxes = openBoxesMap![t.address];

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
              let txs =
                permitsByTxId[p.transactionId]?.filter((t) =>
                  permitBulkAddressSet.has(t.address) || t.address.startsWith("bulk_address_"),
                ) ?? [];

              txs.map(t => {
                const d0 = new Date(t.date);
                if (frommonth != null && fromyear != null && tomonth != null && toyear != null) {
                  if (

                    (d0.getFullYear() > fromyear || (d0.getMonth() + 1 >= frommonth && d0.getFullYear() == fromyear))

                    &&
                    (d0.getFullYear() < toyear || (d0.getMonth() + 1 <= tomonth && d0.getFullYear() == toyear))

                  ) {
                    result.push(permit);
                  }
                } else {


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

    const seen = new Set<string>();
    const filteredResult = result.filter((r: PermitTx) => {
      const key = `${r.transactionId}:${r.address}`;

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });




    return filteredResult;
  }

  async addData(
    address: string,
    transactions: TransactionItem[]
  ): Promise<void> {

    const tempData: PermitTx[] = [];
    const now = Date.now();
    let maxDiff = this.getMaxDownloadDateDifference();

    transactions.forEach((item: TransactionItem) => {
      item.inputs.forEach((input: Input) => {
        if (this.shouldAddInputToDb(input.address, input.assets, item) === false) {
          return;
        }
        input.inputDate = new Date(item.timestamp);

        input.assets = input.assets.filter(
          (a) => a.tokenId != null && a.tokenId in rwtTokenIds,
        );

        const permitTx = this.createPermitTx(
          input.boxId,
          item.id,
          address,
          input.address,
          input.inputDate,
          input.assets,
          getChainTypeForPermitTriggerAddress(address) as ChainType,
        );

        if (permitTx != null && permitTx.date && now - new Date(permitTx.date).getTime() <= maxDiff * 2) {

          tempData.push(permitTx);
        }
      });

      item.outputs.forEach((output: Output) => {
        if (this.shouldAddOutputToDb(output.address) === false) {
          return;
        }
        output.outputDate = new Date(item.timestamp);

        output.assets = output.assets.filter(
          (a) => a.tokenId != null && a.tokenId in rwtTokenIds,
        );
        output.assets.forEach((a) => {
          a.amount = -a.amount;
        });

        const permitTx = this.createPermitTx(
          output.boxId,
          item.id,
          address,
          output.address,
          output.outputDate,
          output.assets,
          getChainTypeForPermitAddress(address) as ChainType,
        );


        if (permitTx != null && permitTx.date && now - new Date(permitTx.date).getTime() <= maxDiff * 2) {
          tempData.push(permitTx);
        }

      });
    });

    await this.storageService.addData(this.storeName, tempData);
  }

  override async purgeData(): Promise<void> {
    let permitTxs = await this.storageService.getData<PermitTx>(this.storeName);
    permitTxs = (await permitTxs).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    let permitTx = null;

    if (permitTxs.length >= rs_FullDownloadsBatchSize) {
      permitTx = permitTxs[rs_FullDownloadsBatchSize - 1];
    } else {
      permitTx = permitTxs[permitTxs.length - 1];
    }

    let maxDiff = this.getMaxDownloadDateDifference();
    const now = Date.now();

    if (permitTx != null && now - permitTx.date.getTime() > maxDiff) {
      maxDiff = now - permitTx.date.getTime();
    }

    var purgePermitTxs = [];
    for (const permitTx of permitTxs) {
      if (
        permitTx.date &&
        now - new Date(permitTx.date).getTime() > maxDiff
      ) {
        purgePermitTxs.push(permitTx);
      }
    }

    await this.storageService.deleteData(this.storeName, purgePermitTxs.map(pt => pt.id));

  }


  async getSortedPermits(): Promise<PermitTx[]> {
    const permitsPromise = await this.getWatcherPermits();

    const sortedPermits: PermitTx[] = [];
    console.log('start retrieving permits from database');
    try {
      const permits = await permitsPromise;

      permits.forEach((permitTx: PermitTx) => {
        sortedPermits.push({
          id: permitTx.id,
          date: permitTx.date,
          address: permitTx.address,
          assets: permitTx.assets,
          wid: permitTx.wid,
          boxId: permitTx.boxId,
          transactionId: permitTx.transactionId,
          chainType:
            (permitTx.chainType as ChainType) ??
            getChainTypeForPermitAddress(permitTx.address),
        });
      });
      console.log(
        'done retrieving permits from database ' + permits.length + ' permits',
      );
      return await new Promise<PermitTx[]>((resolve) => {
        resolve(sortedPermits);
      });
    } catch (error) {
      console.error(error);
      return sortedPermits;
    }
  }
}

(globalThis as any).GetWatcherDataService = (
  permitsDataService: PermitsDataService
): WatcherDataService => {

  return new WatcherDataService(permitsDataService);

};
