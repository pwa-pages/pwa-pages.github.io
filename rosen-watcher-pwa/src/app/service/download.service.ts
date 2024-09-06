import { Injectable } from '@angular/core';
import { of, Observable, throwError, concat, EMPTY } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EventService, EventType } from './event.service';
import { catchError, map } from 'rxjs/operators';

import { firstValueFrom } from 'rxjs';
import { Transaction } from '../models/transaction';

interface TransactionResponse {
  items: Transaction[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  readonly startFrom: Date = new Date('2024-01-01');

  constructor(
    private http: HttpClient,
    private eventService: EventService<string>,
  ) {}

  downloadPermitInfo<T>(watcherUrl: string): Promise<T> {
    return this.download(watcherUrl + '/api/info');
  }

  async download<T>(url: string): Promise<T> {
    console.log('Downloading from:', url);
    return firstValueFrom(this.downloadStream(url));
  }

  downloadStream<T>(url: string): Observable<T> {
    console.log('Attempting to load from cache:', url);

    // Check if the data exists in the cache
    const cachedData = localStorage.getItem(url);
    let cacheObservable: Observable<T>;

    if (cachedData) {
      console.log('Loaded from cache:', url);
      cacheObservable = of(JSON.parse(cachedData));
    } else {
      console.log('No cache available:', url);
      cacheObservable = EMPTY; // Observable that completes immediately
    }

    const downloadObservable = this.http.get<T>(url).pipe(
      map((results: T) => {
        console.log('Downloaded from server:', url);
        localStorage.setItem(url, JSON.stringify(results));
        return results;
      }),
      catchError((error) => {
        console.log('Download failed:', url);
        return throwError(error);
      }),
    );

    // First emit cached data if available, then try to download and emit the new data
    return concat(cacheObservable, downloadObservable);
  }

  downloadTransactions(
    address: string,
    offset = 0,
    limit = 500,
  ): Observable<{ transactions: Transaction[]; total: number }> {
    const url = `https://api.ergoplatform.com/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;

    console.log('Downloading from: ' + url);

    this.eventService.sendEventWithData(EventType.StartDownload, url);

    return this.http.get<TransactionResponse>(url).pipe(
      map((response: TransactionResponse) => {
        const result = {
          transactions: response.items,
          total: response.total,
        };

        for (const item of response.items) {
          const inputDate = new Date(item.timestamp);
          if (inputDate < this.startFrom) {
            this.eventService.sendEventWithData(EventType.EndDownload, url);
            return result; // Return if a transaction is found before the startFrom date
          }
        }

        this.eventService.sendEventWithData(EventType.EndDownload, url);
        return result;
      }),
      catchError((error) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `An error occurred: ${error.error.message}`;
        } else {
          errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
        }

        console.error(errorMessage);

        return throwError(() => new Error(errorMessage));
      }),
    );
  }
}
