import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { of, throwError, concat, EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
let DownloadService = class DownloadService {
    constructor(http) {
        this.http = http;
    }
    downloadPermitInfo(watcherUrl) {
        return this.download(watcherUrl + '/api/info');
    }
    async download(url) {
        console.log('Downloading from:', url);
        return firstValueFrom(this.downloadStream(url));
    }
    downloadStream(url) {
        console.log('Attempting to load from cache:', url);
        // Check if the data exists in the cache
        const cachedData = localStorage.getItem(url);
        let cacheObservable;
        if (cachedData) {
            console.log('Loaded from cache:', url);
            cacheObservable = of(JSON.parse(cachedData));
        }
        else {
            console.log('No cache available:', url);
            cacheObservable = EMPTY; // Observable that completes immediately
        }
        const downloadObservable = this.http.get(url).pipe(map((results) => {
            console.log('Downloaded from server:', url);
            localStorage.setItem(url, JSON.stringify(results));
            return results;
        }), catchError((error) => {
            console.log('Download failed:', url);
            return throwError(error);
        }));
        // First emit cached data if available, then try to download and emit the new data
        return concat(cacheObservable, downloadObservable);
    }
};
DownloadService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], DownloadService);
export { DownloadService };
//# sourceMappingURL=download.service.js.map