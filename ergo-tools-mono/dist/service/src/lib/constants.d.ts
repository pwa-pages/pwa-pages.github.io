export declare const rs_DbName = "rosenDatabase_1.1.5";
export declare const rs_DbVersion = 53;
export declare const rs_DownloadStoreName = "downloads";
export declare const rs_InputsStoreName = "inputBoxes";
export declare const rs_PerfTxStoreName = "perfTxs";
export declare const rs_PermitTxStoreName = "permitTxs";
export declare const rs_ActivePermitTxStoreName = "activePermitTxs";
export declare const rs_ReportsStoreName = "reportsStore";
export declare const rs_WatcherReportsStoreName = "watcherReports";
export declare const rs_DownloadStatusStoreName = "downloadStatusStore";
export declare const rs_OpenBoxesStoreName = "openBoxesStore";
export declare const rs_AddressDataStoreName = "addressData";
export declare const rs_InitialNDownloads = 30;
export declare const rs_FullDownloadsBatchSize = 400;
export declare const rs_PerfInitialNDownloads = 10;
export declare const rs_PerfFullDownloadsBatchSize = 40;
export declare const rs_StartFrom: Date;
export declare const rs_Input_Key: string[];
export declare const rs_Download_Key: string[];
export declare const rs_Permit_Key = "id";
export declare const rs_WatcherReports_Key = "chainType";
export declare const rs_ActivePermit_Key = "id";
export declare const rs_PerfTx_Key = "id";
export declare const rs_Address_Key = "address";
export declare const rs_PermitCost = 3000;
export declare const rs_WatcherCollateralRSN: (chainType: string) => number;
export declare const rs_WatcherCollateralERG: (chainType: string) => number;
export declare const rs_ErgoExplorerHost = "api.ergoplatform.com";
export declare const rs_ErgoNodeHost = "https://node-p2p.ergoplatform.com";
export declare enum UrlAction {
    StatisticsTransactions = "statisticsTransactions",
    ChainPerformanceTransactions = "chainPerformanceTransactions",
    WatchersBalance = "watchersBalance",
    PermitTransactions = "permitTransactions",
    PermitTriggerTransactions = "permitTriggerTransactions",
    PermitBulkTransactions = "permitBulkTransactions"
}
export declare const urlConfig: Record<UrlAction, {
    isNode: boolean;
    url: string;
}[]>;
export declare const getUrlConfig: (key: UrlAction) => {
    isNode: boolean;
    url: string;
};
export declare const rs_RSNTokenId = "8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b";
export declare const rs_eRSNTokenId = "dede2cf5c1a2966453ffec198a9b97b53d281e548903a905519b3525d59cdc3c";
export declare const rs_TokenIdMap: Record<string, string>;
export declare const rs_RSNDecimals = 3;
export interface DateNumberPoint {
    x: Date;
    y: number;
}
export interface IStorageService<T> {
    getData<S = T>(storeName: string, key?: IDBValidKey): Promise<T[] | S[]>;
    getDataById(storeName: string, id: IDBValidKey): Promise<T | null>;
    addData<S = T>(storeName: string, data: S[], key?: IDBValidKey): Promise<void>;
    deleteData(storeName: string, keys: IDBValidKey | IDBValidKey[]): Promise<void>;
}
export declare enum Period {
    Day = "Day",
    Week = "Week",
    Month = "Month",
    Year = "year",
    All = "All"
}
export declare enum Currency {
    EUR = "EUR",
    USD = "USD",
    ERG = "ERG",
    RSN = "RSN"
}
