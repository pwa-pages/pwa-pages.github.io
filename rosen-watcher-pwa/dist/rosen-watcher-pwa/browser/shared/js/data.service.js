// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DataService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getSortedInputs() {
        const inputsPromise = await getWatcherInputs(this.db);
        let amount = 0;
        const sortedInputs = [];
        console.log('start retrieving chart from database');
        try {
            const inputs = await inputsPromise;
            inputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());
            inputs.forEach((input) => {
                input.assets.forEach((asset) => {
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
            return await new Promise((resolve) => {
                resolve(sortedInputs);
            });
        }
        catch (error) {
            console.error(error);
            return sortedInputs;
        }
    }
}
