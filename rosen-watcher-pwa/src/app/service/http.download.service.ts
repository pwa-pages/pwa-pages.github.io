import { Injectable } from '@angular/core';
import { of, Observable, throwError, concat, EMPTY } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { EventService, EventType } from './event.service';

@Injectable({
  providedIn: 'root',
})
export class HttpDownloadService {
  private activeDownloads: Record<string, boolean> = {};
  constructor(
    private http: HttpClient,
    private eventService: EventService,
  ) {}

  downloadPermitInfo<T>(watcherUrl: string): Promise<T> {
    return this.download(watcherUrl + '/api/info');
  }

  async download<T>(url: string): Promise<T> {
    console.log('Downloading from:', url);
    return firstValueFrom(this.downloadStream(url));
  }

  private async initiateDownload() {
    const numActive = Object.values(this.activeDownloads).filter((value) => value === true).length;
    if (numActive == 0) {
      this.eventService.sendEvent(EventType.StartFullDownload);
    }
  }

  private async endDownload(url: string) {
    if (this.activeDownloads[url]) {
      this.activeDownloads[url] = false;
      const numActive = Object.values(this.activeDownloads).filter(
        (value) => value === true,
      ).length;
      if (numActive == 0) {
        this.eventService.sendEvent(EventType.EndFullDownload);
      }
    }
  }

  downloadStream<T>(url: string): Observable<T> {
    this.initiateDownload();
    console.log('Attempting to load from cache:', url);
    this.activeDownloads[url] = true;
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

        this.endDownload(url);
        return results;
      }),
      catchError((error) => {
        console.log('Download failed:', url);

        this.endDownload(url);
        return throwError(error);
      }),
    );

    // First emit cached data if available, then try to download and emit the new data
    return concat(cacheObservable, downloadObservable);
  }
}
