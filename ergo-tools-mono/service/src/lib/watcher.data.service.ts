// eslint-disable-next-line @typescript-eslint/no-unused-vars
class WatcherDataService extends DataService<PermitTx> {
  override getData(): Promise<PermitTx[] | null> {
    return this.storageService.getData<PermitTx>(rs_PermitTxStoreName);
  }
  override async getExistingData(
    transaction: TransactionItem,
    address: string,
  ): Promise<PermitTx | null> {

    for (const input of transaction.inputs) {
      if (input.boxId) {
        const data = await this.storageService.getDataById(rs_PermitTxStoreName,
          this.createUniqueId(input.boxId, transaction.id, address)
        );
        if (data) {
          return data;
        }
      }
    }

    for (const output of transaction.outputs) {
      if (output.boxId) {
        const data = await this.storageService.getDataById(rs_PermitTxStoreName,
          this.createUniqueId(output.boxId, transaction.id, address)
        );
        if (data) {
          return data;
        }
      }
    }

    return null;
  }
  constructor(
    private activePermitsDataService: ActivePermitsDataService,
  ) {
    super(activePermitsDataService.storageService);
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
    return 'permit';
  }

  private async getWatcherPermits(): Promise<PermitTx[]> {
    const permitsPromise = this.storageService.getData<PermitTx>(rs_PermitTxStoreName);

    console.log('Retrieving watcher permits and such');

    try {
      const permits = await permitsPromise;

      permits.forEach((permit: PermitTx) => {
        permit.assets = permit.assets
          .filter((asset: Asset) => asset.tokenId == rs_RSNTokenId)
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

  shouldAddToDb(address: string, assets: Asset[]): boolean {
    return (
      address != null &&
      address.length > 0 &&
      address.length <= 100 &&
      assets.some((asset) => asset.tokenId == rs_RSNTokenId)
    );
  }

 public async getAdressPermits(addresses: string[] | null) {
    const permits = await this.getWatcherPermits();
    const widSums: Record<string, number> = {};

    const permitInfo: PermitInfo[] = [];

    for (const permit of permits) {
      const sum = permit.assets.reduce((acc, asset) => {
        if (asset.tokenId == rs_RSNTokenId) {
          return acc + asset.amount / Math.pow(10, rs_RSNDecimals);
        }
        return acc;
      }, 0);

      if (widSums[permit.wid]) {
        widSums[permit.wid] += sum;
      } else {
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
          chainType: permit.chainType as ChainType,
        });
      }
    }

    let addressActivePermits =
      await this.activePermitsDataService.getAdressPermits(true, null, null, null, null, addresses);

    for (const activePermit of addressActivePermits) {
      const info = permitInfo.find((p) => p.address === activePermit.address);
      if (info) {
        info.activeLockedRSN += rs_PermitCost;
      }
    }

    return permitInfo;
  }

  async addData(
    address: string,
    transactions: TransactionItem[]
  ): Promise<void> {

    const tempData: PermitTx[] = [];

    transactions.forEach((item: TransactionItem) => {
      let iwids = item.inputs
        .flatMap((input) => input.assets)
        .filter((asset) => asset.amount == 2 || asset.amount == 3)
        .flatMap((a) => a.tokenId);

      let owids = item.outputs
        .flatMap((output) => output.assets)
        .filter((asset) => asset.amount == 2 || asset.amount == 3)
        .flatMap((a) => a.tokenId);

      const allWids = Array.from(new Set([...iwids, ...owids]));

      item.inputs.forEach((input: Input) => {
        if (this.shouldAddToDb(input.address, input.assets) === false) {
          return;
        }
        input.inputDate = new Date(item.timestamp);

        input.assets = input.assets.filter(
          (a) => a.tokenId == rs_RSNTokenId || a.amount == 2 || a.amount == 3,
        );

        let wid: string | undefined | null;
        for (wid of allWids) {
          const PermitTx: PermitTx = {
            id: this.createUniqueId(input.boxId, item.id, address),
            address: input.address,
            date: input.inputDate,
            boxId: input.boxId,
            assets: input.assets || [],
            wid: wid ?? '',
            chainType: getChainTypeForPermitAddress(address) as ChainType,
            transactionId: item.id,
          };

          if (PermitTx.assets.length > 0) {
            tempData.push(PermitTx);
          }
        }
      });

      item.outputs.forEach((output: Output) => {
        if (this.shouldAddToDb(output.address, output.assets) === false) {
          return;
        }
        output.outputDate = new Date(item.timestamp);

        output.assets = output.assets.filter(
          (a) => a.tokenId == rs_RSNTokenId || a.amount == 2 || a.amount == 3,
        );
        output.assets.forEach((a) => {
          a.amount = -a.amount;
        });

        let wid: string | undefined | null;
        for (wid of allWids) {
          const PermitTx: PermitTx = {
            id: this.createUniqueId(output.boxId, item.id, address),
            address: output.address,
            date: output.outputDate,
            boxId: output.boxId,
            assets: output.assets || [],
            wid: wid ?? '',
            chainType: getChainTypeForPermitAddress(address) as ChainType,
            transactionId: item.id,
          };

          if (PermitTx.assets.length > 0) {
            tempData.push(PermitTx);
          }
        }
      });
    });

    await this.storageService.addData(rs_PermitTxStoreName, tempData);
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
          chainType:
            (permitTx.chainType as ChainType) ??
            getChainTypeForPermitAddress(permitTx.address),
          transactionId: permitTx.transactionId,
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
