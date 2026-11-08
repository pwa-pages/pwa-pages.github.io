import { Injectable } from '@angular/core';
import { of, Observable, throwError, concat, EMPTY, defer, from } from 'rxjs';
import { catchError, concatMap, finalize, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { EventService } from './event.service';
import { EventType, IDBDatabaseStorageService, rs_DownloadStoreName, rs_ErgoExplorerHost, rs_ErgoNodeHost, WatcherInfo } from '@ergo-tools/service';
import { StorageService } from './storage.service';


@Injectable({
  providedIn: 'root',
})
export class HttpDownloadService {
  private activeDownloads = 0;
  private useNode = false;
  constructor(
    private eventService: EventService,
    private storageService: StorageService,
  ) {}

  downloadPermitInfo<T>(watcherUrl: string): Promise<T> {
    return this.download(watcherUrl + '/api/info');
  }

  async download<T>(url: string): Promise<T> {
    console.log('Downloading from:', url);
    return firstValueFrom(this.downloadStream(url));
  }

  private initiateDownload() {
    if (this.activeDownloads++ === 0) {
      this.eventService.sendEvent(EventType.StartFullDownload);
    }
  }

  private endDownload() {
    if (--this.activeDownloads === 0) {
      this.eventService.sendEvent(EventType.EndFullDownload);
    }
  }

  downloadBalance(address: string): Observable<WatcherInfo> {
    if (!this.useNode) {
      const url = `https://${rs_ErgoExplorerHost}/api/v1/addresses/${address}/balance/confirmed`;
      return this.downloadStream<WatcherInfo>(url);
    } else {
      const url = `https://${rs_ErgoNodeHost}/blockchain/balance`;
      let result = this.downloadPostStream<{ confirmed: WatcherInfo }>(
        url,
        address,
      );
      return result.pipe(
        map(
          (data: { confirmed: WatcherInfo }) => data.confirmed as WatcherInfo,
        ),
      );
    }
  }

  downloadStream<T>(url: string): Observable<T> {
    return this.downloadWithCache<T>(url, url);
  }

  downloadPostStream<T>(url: string, body: string): Observable<T> {
    return this.downloadWithCache<T>(url + body, url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
    });
  }

  private downloadWithCache<T>(key: string, url: string, options?: RequestInit): Observable<T> {
    return defer(() => {
      this.initiateDownload();
      const storage = from(this.storageService.getDB()).pipe(
        map((db) => new IDBDatabaseStorageService<T>(db)),
      );
      const cached = storage.pipe(
        concatMap((store) => from(store.getDataById(rs_DownloadStoreName, [key]))),
        concatMap((entry) => entry === null ? EMPTY : of(entry)),
      );
      const downloaded = defer(() => from(fetch(url, options))).pipe(
        concatMap(async (response) => {
          if (!response.ok) {
            throw new Error(`Server returned code: ${response.status}`);
          }
          return (await response.json()) as T;
        }),
        concatMap((data) => storage.pipe(
          concatMap((store) => from(store.addData(rs_DownloadStoreName, [data], key))),
          map(() => data),
        )),
      );

      return concat(cached, downloaded).pipe(
        catchError((error) => {
          console.error('Download or cache failed:', url, error);
          return throwError(() => error);
        }),
        finalize(() => this.endDownload()),
      );
    });
  }
}
