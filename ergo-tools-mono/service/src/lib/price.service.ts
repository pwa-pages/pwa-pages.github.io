import { finalize, map, shareReplay, tap } from 'rxjs/operators';
import { defer, Observable, of } from 'rxjs';
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

export class PriceService {
  private static readonly refreshIntervalMs = 60_000;

  constructor(private downloadService: DownloadService) { }
  private static currencyRates?: Record<string, Record<string, number>>;
  private static lastRefreshTime?: number;
  private static pricesInFlight?: Observable<Record<string, Record<string, number>>>;

  public convert(amount: number, from: string, to: string): Observable<number> {
    return this.getPrices().pipe(
      map((rates: Record<string, Record<string, number>>) => {
        if (rates[from][to] || rates[from][to] == 0) {
          return rates[from][to] * amount;
        } else {
          return (rates[from]['EUR'] / rates[to]['EUR']) * amount;
        }
      }),
    );
  }

  private getPrices(): Observable<Record<string, Record<string, number>>> {
    return defer(() => {
      if (PriceService.pricesInFlight) {
        return PriceService.pricesInFlight;
      }

      if (PriceService.currencyRates && PriceService.lastRefreshTime !== undefined &&
          Date.now() - PriceService.lastRefreshTime < PriceService.refreshIntervalMs) {
        return of(PriceService.currencyRates);
      }

      const pricesUrl = `https://api.coingecko.com/api/v3/simple/price?ids=rosen-bridge,ergo&vs_currencies=eur,usd`;
      let receivedPrices = false;
      PriceService.pricesInFlight = this.downloadService.downloadStream<CurrencyRates>(pricesUrl).pipe(
        map((data: CurrencyRates) => {
          PriceService.currencyRates = {
            ERG: { EUR: data.ergo.eur, USD: data.ergo.usd },
            RSN: { EUR: data['rosen-bridge'].eur, USD: data['rosen-bridge'].usd },
          };
          receivedPrices = true;
          return PriceService.currencyRates;
        }),
        tap({
          complete: () => {
            if (receivedPrices) {
              PriceService.lastRefreshTime = Date.now();
            }
          },
        }),
        finalize(() => {
          PriceService.pricesInFlight = undefined;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
      return PriceService.pricesInFlight;
    });
  }
}
