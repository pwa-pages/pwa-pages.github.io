import { Injectable } from '@angular/core';
import { of, Observable, throwError, concat, EMPTY } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { EventService, EventType } from './event.service';
import { WatcherInfo } from '../../service/ts/models/watcher.info';

@Injectable({
  providedIn: 'root',
})
export class HttpDownloadService {
  private activeDownloads: Record<string, boolean> = {};
  private useNode = false;
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

  downloadBalance(address: string): Observable<WatcherInfo> {
    if (!this.useNode) {
      const url = `https://${rs_ErgoExplorerHost}/api/v1/addresses/${address}/balance/confirmed`;
      return this.downloadStream<WatcherInfo>(url);
    } else {
      const url = `https://${rs_ErgoNodeHost}/blockchain/balance`;
      let result = this.downloadPostStream<{ confirmed: WatcherInfo }>(url, address);
      return result.pipe(map((data: { confirmed: WatcherInfo }) => data.confirmed as WatcherInfo));
    }
  }

  downloadStream<T>(url: string): Observable<T> {
    this.initiateDownload();
    console.log('Attempting to load from cache:', url);
    this.activeDownloads[url] = true;

    const cachedData = localStorage.getItem(url);
    let cacheObservable: Observable<T>;

    if (cachedData) {
      console.log('Loaded from cache:', url);
      cacheObservable = of(JSON.parse(cachedData));
    } else {
      console.log('No cache available:', url);
      cacheObservable = EMPTY;
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

    return concat(cacheObservable, downloadObservable);
  }

  downloadPostStream<T>(url: string, body: string): Observable<T> {
    let downloadKey = url + body;
    this.initiateDownload();
    console.log('Attempting to load from cache:', downloadKey);
    this.activeDownloads[downloadKey] = true;
    // Check if the data exists in the cache
    const cachedData = localStorage.getItem(downloadKey);
    let cacheObservable: Observable<T>;

    if (cachedData) {
      console.log('Loaded from cache:', downloadKey);
      cacheObservable = of(JSON.parse(cachedData));
    } else {
      console.log('No cache available:', downloadKey);
      cacheObservable = EMPTY;
    }

    const downloadObservable = this.http.post<T>(url, body).pipe(
      map((results: T) => {
        console.log('Downloaded from server:', url);
        localStorage.setItem(downloadKey, JSON.stringify(results));

        this.endDownload(downloadKey);
        return results;
      }),
      catchError((error) => {
        console.log('Download failed:', url);

        this.endDownload(downloadKey);
        return throwError(error);
      }),
    );

    return concat(cacheObservable, downloadObservable);
  }
}
