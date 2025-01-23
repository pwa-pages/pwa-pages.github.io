import { Injectable } from '@angular/core';
import '../../shared/ts/chain.service';
import { map } from 'rxjs/operators';
import { DownloadService } from './download.service';
import { Observable, of } from 'rxjs';

export interface CurrencyRates {
  ergo: {
    eur: number;
    usd: number;
  };
  "rosen-bridge": {
    eur: number;
    usd: number;
  };
}

@Injectable({
  providedIn: 'root',
})

export class PriceService {

  constructor(private downloadService: DownloadService) { }
  private currencyRates: Record<string, Record<string, number>> = {};

  public convert(amount: number, from: string, to: string): Observable<number> {
    return this.getPrices().pipe(
      map((rates: Record<string, Record<string, number>>) => {

        if (rates[from][to]) {
          return rates[from][to] * amount;
        }
        else {
          return (rates[from]['EUR'] / rates[to]['EUR']) * amount;
        }
      })
    );
  }

  private getPrices(): Observable<Record<string, Record<string, number>>> {
    const pricesUrl = `https://api.coingecko.com/api/v3/simple/price?ids=rosen-bridge,ergo&vs_currencies=eur,usd`;


    if (this.currencyRates['ERG']) {
      return of(this.currencyRates);
    }

    this.currencyRates = {
      ERG: { EUR: 0, USD: 0 },
      RSN: { EUR: 0, USD: 0 }
    }

    return this.downloadService
      .downloadStream<CurrencyRates>(pricesUrl)
      .pipe(
        map((data: CurrencyRates) => {
          this.currencyRates['ERG']['EUR'] = data.ergo.eur;
          this.currencyRates['ERG']['USD'] = data.ergo.usd;
          this.currencyRates['RSN']['EUR'] = data["rosen-bridge"].eur;
          this.currencyRates['RSN']['USD'] = data["rosen-bridge"].usd;
          return this.currencyRates;
        }),
      )
  }



}
