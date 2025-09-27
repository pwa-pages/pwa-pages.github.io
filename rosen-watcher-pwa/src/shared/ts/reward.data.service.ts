// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RewardDataService extends DataService<DbInput> {
  override async getExistingData(
    transaction: TransactionItem,
    address: string,
  ): Promise<DbInput | null> {
    for (const input of transaction.inputs) {
      if (input.boxId && getChainType(input.address)) {
        const data = await this.getDataByBoxId(input.boxId, address, this.db);
        if (data) {
          return data;
        }
      }
    }

    return null;
  }
  constructor(
    public override db: IDBDatabase,
    private chartService: ChartService,
    private eventSender: EventSender,
  ) {
    super(db);
  }

  getDataType(): string {
    return 'reward';
  }

  private async getWatcherInputs(): Promise<DbInput[]> {
    const inputsPromise = this.getData<DbInput>(rs_InputsStoreName);

    console.log('Retrieving watcher inputs and such');

    try {
      const inputs = await inputsPromise;

      const filteredInputs = inputs.filter(
        (i: DbInput) => i.chainType != null || getChainType(i.address) != null,
      );

      filteredInputs.forEach((input: DbInput) => {
        input.assets = input.assets
          .filter(
            (asset: Asset) => asset.tokenId == rs_RSNTokenId || asset.tokenId == rs_eRSNTokenId,
          )
          .map((asset_1: Asset) => {
            return asset_1;
          });
      });
      filteredInputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());

      return await new Promise<DbInput[]>((resolve) => {
        resolve(filteredInputs);
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async addData(address: string, transactions: TransactionItem[], db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create a temporary array to hold DbInput items before bulk insertion
      const tempData: DbInput[] = [];

      // Populate tempData with processed inputs
      transactions.forEach((item: TransactionItem) => {
        item.inputs.forEach((input: Input) => {
          input.outputAddress = address;
          input.inputDate = new Date(item.timestamp);

          input.assets = input.assets.filter(
            (a) => a.tokenId == rs_RSNTokenId || a.tokenId == rs_eRSNTokenId,
          );

          input.assets.forEach((asset) => {
            if (asset.tokenId && rs_TokenIdMap[asset.tokenId]) {
              asset.name = rs_TokenIdMap[asset.tokenId];
              asset.decimals = rs_RSNDecimals;
            }
          });

          const dbInput: DbInput = {
            outputAddress: input.outputAddress,
            inputDate: input.inputDate,
            boxId: input.boxId,
            assets: input.assets || [],
            chainType: getChainType(input.address) as ChainType,
          };

          if (dbInput.chainType && dbInput.assets.length > 0) {
            tempData.push(dbInput);
          }
        });
      });

      const transaction: IDBTransaction = db.transaction([rs_InputsStoreName], 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(rs_InputsStoreName);

      const putPromises = tempData.map((dbInput: DbInput) => {
        return new Promise<void>((putResolve, putReject) => {
          const request: IDBRequest = objectStore.put(dbInput);
          request.onsuccess = () => putResolve();
          request.onerror = (event: Event) => putReject((event.target as IDBRequest).error);
        });
      });

      Promise.all(putPromises)
        .then(async () => {
          const inputs = await this.getSortedInputs();

          this.eventSender.sendEvent({
            type: 'InputsChanged',
            data: inputs,
          });

          this.eventSender.sendEvent({
            type: 'AddressChartChanged',
            data: await this.chartService.getAddressCharts(inputs),
          });

          resolve();
        })
        .catch(reject);
    });
  }

  // Get Data by BoxId from IndexedDB
  private async getDataByBoxId(
    boxId: string,
    addressId: string,
    db: IDBDatabase,
  ): Promise<DbInput | null> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = db.transaction([rs_InputsStoreName], 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore(rs_InputsStoreName);
      const request: IDBRequest = objectStore.get([
        boxId,
        addressId,
      ]); /* ?? objectStore.get([boxId.slice(0, 12), addressId])*/

      request.onsuccess = () => {
        const result: DbInput | undefined = request.result as DbInput | undefined;
        if (!result || result.outputAddress !== addressId) {
          resolve(null);
        } else {
          resolve(result);
        }
      };

      request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }

  async getSortedInputs(): Promise<Input[]> {
    const inputsPromise = await this.getWatcherInputs();
    let amount = 0;
    const sortedInputs: Input[] = [];
    console.log('start retrieving chart from database');
    try {
      const inputs = await inputsPromise;

      inputs.forEach((input: DbInput) => {
        input.assets.forEach((asset: Asset) => {
          amount += asset.amount;
          sortedInputs.push({
            inputDate: input.inputDate,
            address: input.address ?? '',
            assets: input.assets,
            outputAddress: input.outputAddress,
            boxId: input.boxId,
            accumulatedAmount: amount,
            amount: asset.amount / Math.pow(10, asset.decimals),
            chainType: (input.chainType as ChainType) ?? getChainType(input.address),
          });
        });
      });
      console.log('done retrieving chart from database ' + inputs.length + ' inputs');
      return await new Promise<Input[]>((resolve) => {
        resolve(sortedInputs);
      });
    } catch (error) {
      console.error(error);
      return sortedInputs;
    }
  }
}
