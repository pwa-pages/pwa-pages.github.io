// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DownloadService {
  constructor(private db: IDBDatabase) {}

  async getSortedInputs(): Promise<Input[]> {
    const inputsPromise = await getWatcherInputs(this.db);
    let amount = 0;
    const sortedInputs: Input[] = [];
    console.log('start retrieving chart from database');
    try {
      const inputs = await inputsPromise;

      inputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());

      inputs.forEach((input: Input) => {
        input.assets.forEach((asset: Asset) => {
          amount += asset.amount;
          sortedInputs.push({
            inputDate: input.inputDate,
            address: input.address,
            assets: input.assets,
            outputAddress: input.outputAddress,
            boxId: input.boxId,
            accumulatedAmount: amount,
            amount: asset.amount / Math.pow(10, asset.decimals),
            chainType: getChainType(input.address),
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
