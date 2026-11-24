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
    private static readonly refreshIntervalMs;
    constructor(downloadService: DownloadService);
    private static currencyRates?;
    private static lastRefreshTime?;
    private static pricesInFlight?;
    convert(amount: number, from: string, to: string): Observable<number>;
    private getPrices;
}
