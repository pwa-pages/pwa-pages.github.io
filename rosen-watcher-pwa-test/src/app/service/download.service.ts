import { Injectable } from '@angular/core';
import { of, Observable, throwError, concat, EMPTY } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  constructor(private http: HttpClient) {}

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
}
