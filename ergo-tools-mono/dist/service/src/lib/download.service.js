import { of, throwError, concat, EMPTY, defer, from } from 'rxjs';
import { catchError, concatMap, finalize, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { EventType, IDBDatabaseStorageService, rs_DownloadStoreName, rs_ErgoExplorerHost, rs_ErgoNodeHost } from '.';
export class DownloadService {
    constructor(eventSender, dbOrStorage) {
        this.eventSender = eventSender;
        this.dbOrStorage = dbOrStorage;
        this.activeDownloads = 0;
        this.useNode = false;
    }
    downloadPermitInfo(watcherUrl) {
        return this.download(watcherUrl + '/api/info');
    }
    async download(url) {
        console.log('Downloading from:', url);
        return firstValueFrom(this.downloadStream(url));
    }
    initiateDownload() {
        if (this.activeDownloads++ === 0) {
            this.eventSender.sendEvent({ type: EventType.StartFullDownload });
        }
    }
    endDownload() {
        if (--this.activeDownloads === 0) {
            this.eventSender.sendEvent({ type: EventType.EndFullDownload });
        }
    }
    downloadBalance(address) {
        if (!this.useNode) {
            const url = `https://${rs_ErgoExplorerHost}/api/v1/addresses/${address}/balance/confirmed`;
            return this.downloadStream(url);
        }
        else {
            const url = `https://${rs_ErgoNodeHost}/blockchain/balance`;
            let result = this.downloadPostStream(url, address);
            return result.pipe(map((data) => data.confirmed));
        }
    }
    downloadStream(url) {
        return this.downloadWithCache(url, url);
    }
    downloadPostStream(url, body) {
        return this.downloadWithCache(url + body, url, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body,
        });
    }
    downloadWithCache(key, url, options) {
        return defer(() => {
            this.initiateDownload();
            const storage = this.dbOrStorage instanceof IDBDatabase
                ? new IDBDatabaseStorageService(this.dbOrStorage)
                : this.dbOrStorage;
            const cached = defer(() => from(storage.getDataById(rs_DownloadStoreName, key))).pipe(concatMap((entry) => {
                if (entry === null)
                    return EMPTY;
                return of(entry);
            }));
            const downloaded = defer(() => from(fetch(url, options))).pipe(concatMap(async (response) => {
                if (!response.ok) {
                    throw new Error(`Server returned code: ${response.status}`);
                }
                return (await response.json());
            }), concatMap((data) => from(storage.addData(rs_DownloadStoreName, [data], key)).pipe(map(() => data))));
            return concat(cached, downloaded).pipe(catchError((error) => {
                console.error('Download or cache failed:', url, error);
                return throwError(() => error);
            }), finalize(() => this.endDownload()));
        });
    }
}
//# sourceMappingURL=download.service.js.map