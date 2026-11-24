import { of, Observable, throwError, concat, EMPTY, defer, from } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { IStorageService, rs_DownloadStoreName, rs_ErgoExplorerHost, rs_ErgoNodeHost, WatcherInfo } from '.';
export class DownloadService {
  private static readonly maxLoggedUrlLength = 200;
  private useNode = false;
  constructor(
    private storageService: IStorageService
  ) {}

  downloadPermitInfo<T>(watcherUrl: string): Promise<T> {
    return this.download(watcherUrl + '/api/info');
  }

  async download<T>(url: string): Promise<T> {
    console.log('Downloading from:', this.formatUrlForLog(url));
    return firstValueFrom(this.downloadStream(url));
  }

  private formatUrlForLog(url: string): string {
    if (url.length <= DownloadService.maxLoggedUrlLength) return url;
    return `${url.slice(0, DownloadService.maxLoggedUrlLength)}... (truncated; ${url.length} characters)`;
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
      
      const cached: Observable<T> = defer(() => from(this.storageService.getDataById(rs_DownloadStoreName, key))).pipe(
        concatMap((entry) => {
          if (entry == null) return EMPTY;
          return of(entry as T);
        }),
      );

      
      const downloaded = defer(() => from(fetch(url, options))).pipe(
        concatMap(async (response) => {
          if (!response.ok) {
            throw new Error(`Server returned code: ${response.status}`);
          }
          return (await response.json()) as T;
        }),
        concatMap((data) => from(this.storageService.addData(rs_DownloadStoreName, [data], key)).pipe(
          map(() => data),
        )),
      );

      return concat(cached, downloaded).pipe(
        catchError((error) => {
          console.error('Download or cache failed:', this.formatUrlForLog(url), error);
          return throwError(() => error);
        })
      );
    });
  }
}
