// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ChartService {
    async getAddressCharts(inputs) {
        const addressCharts = {};
        inputs.forEach((input) => {
            input.assets.forEach((asset) => {
                if (!addressCharts[input.outputAddress]) {
                    addressCharts[input.outputAddress] = { charts: {}, chainType: null };
                }
                const currentDate = new Date();
                const halfYearAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
                if (input.inputDate > halfYearAgo) {
                    const dt = new Date(input.inputDate.getFullYear(), input.inputDate.getMonth(), input.inputDate.getDate() - input.inputDate.getDay()).getTime();
                    if (!addressCharts[input.outputAddress].charts[dt]) {
                        addressCharts[input.outputAddress].charts[dt] = 0;
                    }
                    addressCharts[input.outputAddress].charts[dt] +=
                        asset.amount / Math.pow(10, asset.decimals);
                    addressCharts[input.outputAddress].chainType =
                        input.chainType ?? getChainType(input.address);
                }
            });
        });
        return addressCharts;
    }
    async getAmountsByDate(inputs, period) {
        const reducedInputs = this.reduceData(inputs, period);
        const amounts = reducedInputs.map((s) => {
            return { x: s.inputDate, y: s.amount };
        });
        return amounts;
    }
    reduceData(inputs, period) {
        const date = new Date();
        switch (period) {
            case Period.Day:
                date.setDate(date.getDate() - 1);
                break;
            case Period.Week:
                date.setDate(date.getDate() - 7);
                break;
            case Period.Month:
                date.setMonth(date.getMonth() - 1);
                break;
            case Period.Year:
                date.setFullYear(date.getFullYear() - 1);
                break;
            default:
                date.setFullYear(date.getFullYear() - 100);
        }
        inputs = inputs.filter((r) => r.inputDate >= date);
        return inputs;
    }
}
