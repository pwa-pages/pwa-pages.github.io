import { map } from 'rxjs/operators';
import { of } from 'rxjs';
export class PriceService {
    constructor(downloadService) {
        this.downloadService = downloadService;
        this.currencyRates = {};
    }
    convert(amount, from, to) {
        return this.getPrices().pipe(map((rates) => {
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
            return of(this.currencyRates);
        }
        this.currencyRates = {
            ERG: { EUR: 0, USD: 0 },
            RSN: { EUR: 0, USD: 0 },
        };
        return this.downloadService.downloadStream(pricesUrl).pipe(map((data) => {
            this.currencyRates['ERG']['EUR'] = data.ergo.eur;
            this.currencyRates['ERG']['USD'] = data.ergo.usd;
            this.currencyRates['RSN']['EUR'] = data['rosen-bridge'].eur;
            this.currencyRates['RSN']['USD'] = data['rosen-bridge'].usd;
            return this.currencyRates;
        }));
    }
}
//# sourceMappingURL=price.service.js.map