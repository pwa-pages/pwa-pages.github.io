"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceService = void 0;
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
class PriceService {
    static { this.refreshIntervalMs = 60_000; }
    constructor(downloadService) {
        this.downloadService = downloadService;
    }
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
        return (0, rxjs_1.defer)(() => {
            if (PriceService.pricesInFlight) {
                return PriceService.pricesInFlight;
            }
            if (PriceService.currencyRates && PriceService.lastRefreshTime !== undefined &&
                Date.now() - PriceService.lastRefreshTime < PriceService.refreshIntervalMs) {
                return (0, rxjs_1.of)(PriceService.currencyRates);
            }
            const pricesUrl = `https://api.coingecko.com/api/v3/simple/price?ids=rosen-bridge,ergo&vs_currencies=eur,usd`;
            let receivedPrices = false;
            PriceService.pricesInFlight = this.downloadService.downloadStream(pricesUrl).pipe((0, operators_1.map)((data) => {
                PriceService.currencyRates = {
                    ERG: { EUR: data.ergo.eur, USD: data.ergo.usd },
                    RSN: { EUR: data['rosen-bridge'].eur, USD: data['rosen-bridge'].usd },
                };
                receivedPrices = true;
                return PriceService.currencyRates;
            }), (0, operators_1.tap)({
                complete: () => {
                    if (receivedPrices) {
                        PriceService.lastRefreshTime = Date.now();
                    }
                },
            }), (0, operators_1.finalize)(() => {
                PriceService.pricesInFlight = undefined;
            }), (0, operators_1.shareReplay)({ bufferSize: 1, refCount: false }));
            return PriceService.pricesInFlight;
        });
    }
}
exports.PriceService = PriceService;
//# sourceMappingURL=price.service.js.map