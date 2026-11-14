import { Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { PriceService } from './price.service';
import { DownloadService, EventSender } from '.';
import { WatchersStats, WatcherInfo, Token } from './models';
export declare class WatchersDataService {
    private downloadService;
    private priceService;
    private eventSender;
    isChainTypeActive(chainType: string): boolean;
    readonly rsnToken = "8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b";
    readonly watchersStatsSignal: import("@angular/core").WritableSignal<WatchersStats>;
    readonly watchersStats: WatchersStats;
    busyCounter: number;
    constructor(downloadService: DownloadService<WatcherInfo>, priceService: PriceService, eventSender: EventSender);
    getWatcherStats(): Signal<WatchersStats>;
    getWatchersInfo(): Observable<WatcherInfo>;
    getPermitsInfo(chainType: string): Observable<Token | undefined>;
    private updateTotal;
    private convertCurrencies;
    private updateTotalLocked;
    private getValue;
    setLockedAmounts(chainType: string): Promise<void>;
    currencyUpdate(): Promise<void>;
    private downloadPermitInfo;
    getTriggerPermitsInfo(chainType: string): Observable<Token | undefined>;
    getBulkPermitsInfo(chainType: string): Observable<Token | undefined>;
    download(): Promise<Signal<WatchersStats>>;
}
