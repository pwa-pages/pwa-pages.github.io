import { Injectable } from '@angular/core';
import { of, Observable, throwError, concat, EMPTY } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EventService, EventType } from './event.service';
import { catchError, map } from 'rxjs/operators';

import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  readonly startFrom: Date = new Date('2024-01-01');

  constructor(
    private http: HttpClient,
    private eventService: EventService<string>,
  ) {}

  downloadPermitInfo(watcherUrl: string): Promise<any> {
    return this.download(watcherUrl + '/api/info');
  }

  async download(url: string): Promise<any> {
    console.log('Downloading from:', url);
    return firstValueFrom(this.downloadStream(url));
  }

  downloadStream(url: string): Observable<any> {
    console.log('Attempting to load from cache:', url);

    // Check if the data exists in the cache
    const cachedData = localStorage.getItem(url);
    let cacheObservable: Observable<any>;

    if (cachedData) {
      console.log('Loaded from cache:', url);
      cacheObservable = of(JSON.parse(cachedData));
    } else {
      console.log('No cache available:', url);
      cacheObservable = EMPTY; // Observable that completes immediately
    }

    const downloadObservable = this.http.get(url).pipe(
      map((results: any) => {
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

  downloadTransactions(address: string, offset = 0, limit = 500): Observable<any> {
    const url = `https://api.ergoplatform.com/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;

    console.log('Downloading from: ' + url);

    this.eventService.sendEventWithData(EventType.StartDownload, url);
    return this.http.get(url).pipe(
      map((response: any) => {
        const result = {
          transactions: response.items,
          total: response.total,
        };

        for (const item of response.items) {
          const inputDate = new Date(item.timestamp);
          if (inputDate < this.startFrom) {
            this.eventService.sendEventWithData(EventType.EndDownload, url);
            return result;
          }
          break;
        }

        this.eventService.sendEventWithData(EventType.EndDownload, url);
        return result;
      }),
      this.handleError(),
    );
  }

  private handleError() {
    return catchError((error: HttpErrorResponse) => {
      let errorMessage = '';
      if (error.error instanceof ErrorEvent) {
        errorMessage = `An error occurred: ${error.error.message}`;
      } else {
        errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
      }

      console.error(errorMessage);

      return throwError(() => new Error(errorMessage));
    });
  }
}
