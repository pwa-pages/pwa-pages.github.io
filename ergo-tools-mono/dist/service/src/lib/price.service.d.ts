import { Observable } from 'rxjs';
import { DownloadService } from '.';
export interface CurrencyRates {
    ergo: {
        eur: number;
        usd: number;
    };
    'rosen-bridge': {
        eur: number;
        usd: number;
    };
}
export declare class PriceService {
    private downloadService;
    constructor(downloadService: DownloadService<CurrencyRates>);
    private currencyRates;
    convert(amount: number, from: string, to: string): Observable<number>;
    private getPrices;
}
