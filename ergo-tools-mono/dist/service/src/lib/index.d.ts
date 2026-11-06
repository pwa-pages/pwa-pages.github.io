import { PermitInfo, PermitTx } from './data.service';
export * from './address';
export * from './input';
export * from './asset';
export * from './data.service';
export * from './permits.data.service';
export * from './reports.data.service';
export * from './chain.performance.data.service';
export * from './chain.service';
export * from './chart.service';
export * from './chart.dataset';
export * from './constants';
export * from './data.service';
export * from './download.status.indexeddb.service';
export * from './i-db-databasestorage.service';
export * from './memory.storage.service';
export * from './watcher.data.service';
export * from './watcher.info';
export * from './token';
export * from './process.event.service';
export * from './reward.data.service';
export * from './rosen-download-worker';
export declare function getAllChainTypes(): string[];
export declare function getCurrencyValues(): string[];
export declare function getPermitAddressesByChainType(): Record<string, string | null>;
export declare function getPermitBulkAddressesByChainType(): Record<string, string | null>;
export declare function getPermitTriggerAddressesByChainType(): Record<string, string | null>;
export declare function getChainTypeTokensByChainType(): Record<string, string | null>;
export declare function getChainTypeWatcherIdentifiersByChainType(): Record<string, string | null>;
export declare function getActivatedChainTypes(): string[];
export declare function getChainTypeForAddress(address?: string): string | null | undefined;
export declare function getRewardAddressForChainType(chainType: string): string | null | undefined;
export interface IProcessEventService {
    processEvent(event: EvtPayload<object>): Promise<void>;
}
export interface EvtPayload<T> {
    type: string;
    data?: T;
}
export interface EvtSender {
    sendEvent<T>(event: EvtPayload<T>): Promise<void>;
}
export declare function createProcessEvtService(eventSender: EvtSender): IProcessEventService;
export interface PermitsDataService {
    getAdressPermits(activeOnly: boolean, frommonth: number, fromyear: number, tomonth: number, toyear: number): Promise<PermitTx[]>;
}
export interface WatcherDataService {
    getAdressPermits(): Promise<PermitInfo[]>;
}
export interface IDownloadService<SERVICE> {
    downloadForAddress<T>(address: string, urlAction: string, callback?: () => Promise<T>): Promise<T[]>;
    getDataService(): SERVICE;
}
export declare function GetWatcherDataService(permitsDataService: PermitsDataService): WatcherDataService;
export declare function GetPermitsDownloadService(maxDownloadDateDifference: number): IDownloadService<PermitsDataService>;
export declare function GetWatcherDownloadService(): IDownloadService<WatcherDataService>;
export declare class ErgSettings {
    static rs_ErgoExplorerHost(): string;
    static rs_ErgoNodeHost(): string;
    static rs_dbName(): string;
    static rs_DbVersion(): number;
    static rs_InputsStoreName(): string;
    static rs_PerfTxStoreName(): string;
    static rs_PermitTxStoreName(): string;
    static rs_ActivePermitTxStoreName(): string;
    static rs_ReportsStoreName(): string;
    static rs_WatcherReportsStoreName(): string;
    static rs_DownloadStatusStoreName(): string;
    static rs_OpenBoxesStoreName(): string;
    static rs_AddressDataStoreName(): string;
    static rs_InitialNDownloads(): number;
    static rs_FullDownloadsBatchSize(): number;
    static rs_PerfInitialNDownloads(): number;
    static rs_PerfFullDownloadsBatchSize(): number;
    static rs_StartFrom(): Date;
    static rs_Input_Key(): string[];
    static rs_Permit_Key(): string;
    static rs_WatcherReports_Key(): string;
    static rs_ActivePermit_Key(): string;
    static rs_PerfTx_Key(): string;
    static rs_Address_Key(): string;
    static rs_PermitCost(): number;
    static rs_WatcherCollateralRSN(chainType: string): number;
    static rs_WatcherCollateralERG(chainType: string): number;
    static rs_RSNTokenId(): string;
    static rs_eRSNTokenId(): string;
    static rs_TokenIdMap(): Record<string, string>;
    static rs_RSNDecimals(): number;
}
