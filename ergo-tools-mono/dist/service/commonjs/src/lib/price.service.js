"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceService = void 0;
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
class PriceService {
    downloadService;
    constructor(downloadService) {
        this.downloadService = downloadService;
    }
    currencyRates = {};
    convert(amount, from, to) {
        return this.getPrices().pipe((0, operators_1.map)((rates) => {
            if (rates[from][to] || rates[from][to] == 0) {
                return rates[from][to] * amount;
            }
            else {
                return (rates[from]['EUR'] / rates[to]['EUR']) * amount;
            }
        }));
    }
    getPrices() {
        const pricesUrl = `https://api.coingecko.com/api/v3/simple/price?ids=rosen-bridge,ergo&vs_currencies=eur,usd`;
        if (this.currencyRates['ERG']) {
            return (0, rxjs_1.of)(this.currencyRates);
        }
        this.currencyRates = {
            ERG: { EUR: 0, USD: 0 },
            RSN: { EUR: 0, USD: 0 },
        };
        return this.downloadService.downloadStream(pricesUrl).pipe((0, operators_1.map)((data) => {
            this.currencyRates['ERG']['EUR'] = data.ergo.eur;
            this.currencyRates['ERG']['USD'] = data.ergo.usd;
            this.currencyRates['RSN']['EUR'] = data['rosen-bridge'].eur;
            this.currencyRates['RSN']['USD'] = data['rosen-bridge'].usd;
            return this.currencyRates;
        }));
    }
}
exports.PriceService = PriceService;
