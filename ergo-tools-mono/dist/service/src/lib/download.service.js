"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadService = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const rxjs_2 = require("rxjs");
const _1 = require(".");
class DownloadService {
    static { this.maxLoggedUrlLength = 200; }
    constructor(eventSender, storageService) {
        this.eventSender = eventSender;
        this.storageService = storageService;
        this.activeDownloads = 0;
        this.useNode = false;
    }
    downloadPermitInfo(watcherUrl) {
        return this.download(watcherUrl + '/api/info');
    }
    async download(url) {
        console.log('Downloading from:', this.formatUrlForLog(url));
        return (0, rxjs_2.firstValueFrom)(this.downloadStream(url));
    }
    formatUrlForLog(url) {
        if (url.length <= DownloadService.maxLoggedUrlLength)
            return url;
        return `${url.slice(0, DownloadService.maxLoggedUrlLength)}... (truncated; ${url.length} characters)`;
    }
    initiateDownload() {
        if (this.activeDownloads++ === 0) {
            this.eventSender.sendEvent({ type: _1.EventType.StartFullDownload });
        }
    }
    endDownload() {
        if (--this.activeDownloads === 0) {
            this.eventSender.sendEvent({ type: _1.EventType.EndFullDownload });
        }
    }
    downloadBalance(address) {
        if (!this.useNode) {
            const url = `https://${_1.rs_ErgoExplorerHost}/api/v1/addresses/${address}/balance/confirmed`;
            return this.downloadStream(url);
        }
        else {
            const url = `https://${_1.rs_ErgoNodeHost}/blockchain/balance`;
            let result = this.downloadPostStream(url, address);
            return result.pipe((0, operators_1.map)((data) => data.confirmed));
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
        return (0, rxjs_1.defer)(() => {
            this.initiateDownload();
            const cached = (0, rxjs_1.defer)(() => (0, rxjs_1.from)(this.storageService.getDataById(_1.rs_DownloadStoreName, key))).pipe((0, operators_1.concatMap)((entry) => {
                if (entry == null)
                    return rxjs_1.EMPTY;
                return (0, rxjs_1.of)(entry);
            }));
            const downloaded = (0, rxjs_1.defer)(() => (0, rxjs_1.from)(fetch(url, options))).pipe((0, operators_1.concatMap)(async (response) => {
                if (!response.ok) {
                    throw new Error(`Server returned code: ${response.status}`);
                }
                return (await response.json());
            }), (0, operators_1.concatMap)((data) => (0, rxjs_1.from)(this.storageService.addData(_1.rs_DownloadStoreName, [data], key)).pipe((0, operators_1.map)(() => data))));
            return (0, rxjs_1.concat)(cached, downloaded).pipe((0, operators_1.catchError)((error) => {
                console.error('Download or cache failed:', this.formatUrlForLog(url), error);
                return (0, rxjs_1.throwError)(() => error);
            }), (0, operators_1.finalize)(() => this.endDownload()));
        });
    }
}
exports.DownloadService = DownloadService;
//# sourceMappingURL=download.service.js.map