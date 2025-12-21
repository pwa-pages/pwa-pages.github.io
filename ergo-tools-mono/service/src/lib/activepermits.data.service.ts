interface OpenBoxes {
  address: string;
  openBoxesJson: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ActivePermitsDataService extends DataService<PermitTx> {
  override async getExistingData(
    transaction: TransactionItem,
    address: string,
  ): Promise<PermitTx | null> {

    for (const input of transaction.inputs) {
      if (input.boxId) {
        const data = await this.storageService.getDataById(
          rs_ActivePermitTxStoreName, this.createUniqueId(input.boxId, transaction.id, address)
        );
        if (data) {
          return data;
        }
      }
    }

    for (const output of transaction.outputs) {
      if (output.boxId) {
        const data = await this.storageService.getDataById(
          rs_ActivePermitTxStoreName, this.createUniqueId(output.boxId, transaction.id, address)
        );
        if (data) {
          return data;
        }
      }
    }

    return null;
  }
  constructor(db: IDBDatabase | IStorageService<PermitTx>) {
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

  getDataType(): string {
    return 'activepermit';
  }

  override getMaxDownloadDateDifference(): number {
    return 204800000;
  }

  private async getWatcherPermits(): Promise<PermitTx[]> {
    const permitsPromise = this.storageService.getData<PermitTx>(rs_ActivePermitTxStoreName);

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
    for (const [, address] of Object.entries(permitBulkAddresses)) {
      if (address) {


        var json = (await boxes).filter(ob => ob.address === address);

        if (json.length != 0) {
          openBoxesMap[address] = JSON.stringify(json);
        }
        else {
          openBoxesMap[address] = null;
        }


      }
    }
    return openBoxesMap;
  }

  shouldAddInputToDb(address: string, assets: Asset[]): boolean {
    return (
      (address != null && address.length <= 100 && assets.length > 0) ||
      Object.values(permitTriggerAddresses).includes(address)
    );
  }

  shouldAddOutputToDb(address: string): boolean {
    return (
      Object.values(permitBulkAddresses).includes(address) ||
      Object.values(permitTriggerAddresses).includes(address) ||
      Object.values(rewardAddresses).includes(address)
    );
  }

  async getAdressActivePermits(
    addresses: string[] | null = null,
  ): Promise<PermitTx[]> {
    const permits = await this.getWatcherPermits();

    const openBoxesMap = await this.getOpenBoxesMap();

    let addressPermits = new Array<PermitTx>();
    if (addresses != null && addresses.length > 0) {
      addressPermits = permits.filter((info) =>
        addresses.some((addr) => addr === info.address),
      );
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

    for (const permit of addressPermits) {
      let outputs = (permitsByTxId[permit.transactionId] ?? []).filter((o) =>
        Object.values(permitTriggerAddresses).some(
          (address) => address === o.address,
        ),
      );
      let foundResolved = false;

      for (const output of outputs) {
        let cnt = boxIdMap[output.boxId] ?? [];
        if (cnt.length >= 2) {
          foundResolved = true;

          for (const p of cnt) {
            let txs =
              permitsByTxId[p.transactionId]?.filter((t) =>
                Object.values(permitBulkAddresses).includes(t.address),
              ) ?? [];
            await Promise.all(
              txs.map(async (t) => {
                let openBoxes = openBoxesMap![t.address];

                if (openBoxes && openBoxes.indexOf(t.boxId) !== -1) {
                  if (!result.some((r) => r.boxId === t.boxId)) {
                    result.push(permit);
                  }
                }
              }),
            );
          }
        }
      }

      if (foundResolved === false) {
        result.push(permit);
      }
    }


    const seen = new Set<string>();
    const filteredResult = result.filter((r: PermitTx) => {
      if (seen.has(r.transactionId)) return false;
      seen.add(r.transactionId);
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
        if (this.shouldAddInputToDb(input.address, input.assets) === false) {
          return;
        }
        input.inputDate = new Date(item.timestamp);

        input.assets = input.assets.filter(
          (a) => a.tokenId != null && a.tokenId in rwtTokenIds,
        );

        const permitTx: PermitTx = {
          id: this.createUniqueId(input.boxId, item.id, address),
          address: input.address,
          date: input.inputDate,
          boxId: input.boxId,
          assets: input.assets || [],
          wid: '',
          chainType: getChainTypeForPermitAddress(address) as ChainType,
          transactionId: item.id,
        };

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

        const permitTx: PermitTx = {
          id: this.createUniqueId(output.boxId, item.id, address),
          address: output.address,
          date: output.outputDate,
          boxId: output.boxId,
          assets: output.assets || [],
          wid: '',
          chainType: getChainTypeForPermitAddress(address) as ChainType,
          transactionId: item.id,
        };

        


        if (permitTx != null && permitTx.date && now - new Date(permitTx.date).getTime() <= maxDiff * 2) {
          tempData.push(permitTx);
        }


      });
    });

    await this.storageService.addData(rs_ActivePermitTxStoreName, tempData);
  }

  override async purgeData(): Promise<void> {
    let permitTxs = await this.storageService.getData<PermitTx>(rs_ActivePermitTxStoreName);
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

    await this.storageService.deleteData(rs_ActivePermitTxStoreName, purgePermitTxs.map(pt => pt.id));

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
