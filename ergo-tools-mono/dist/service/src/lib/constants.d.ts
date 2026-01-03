declare const rs_DbName = "rosenDatabase_1.1.5";
declare const rs_DbVersion = 38;
declare const rs_InputsStoreName = "inputBoxes";
declare const rs_PerfTxStoreName = "perfTxs";
declare const rs_PermitTxStoreName = "permitTxs";
declare const rs_ActivePermitTxStoreName = "activePermitTxs";
declare const rs_DownloadStatusStoreName = "downloadStatusStore";
declare const rs_OpenBoxesStoreName = "openBoxesStore";
declare const rs_AddressDataStoreName = "addressData";
declare const rs_InitialNDownloads = 30;
declare const rs_FullDownloadsBatchSize = 400;
declare const rs_PerfInitialNDownloads = 10;
declare const rs_PerfFullDownloadsBatchSize = 40;
declare const rs_StartFrom: Date;
declare const rs_Input_Key: string[];
declare const rs_Permit_Key = "id";
declare const rs_ActivePermit_Key = "id";
declare const rs_PerfTx_Key = "id";
declare const rs_Address_Key = "address";
declare const rs_PermitCost = 3000;
declare const rs_WatcherCollateralRSN: (chainType: string) => number;
declare const rs_WatcherCollateralERG: (chainType: string) => number;
declare const rs_ErgoExplorerHost = "api.ergoplatform.com";
declare const rs_ErgoNodeHost = "https://node-p2p.ergoplatform.com";
declare const rs_RSNTokenId = "8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b";
declare const rs_eRSNTokenId = "dede2cf5c1a2966453ffec198a9b97b53d281e548903a905519b3525d59cdc3c";
declare const rs_TokenIdMap: Record<string, string>;
declare const rs_RSNDecimals = 3;
interface DateNumberPoint {
    x: Date;
    y: number;
}
interface IStorageService<T> {
    getData<S = T>(storeName: string): Promise<T[] | S[]>;
    getDataById(storeName: string, id: IDBValidKey): Promise<T | null>;
    addData<S = T>(storeName: string, data: S[]): Promise<void>;
    deleteData(storeName: string, keys: IDBValidKey | IDBValidKey[]): Promise<void>;
}
declare enum Period {
    Day = "Day",
    Week = "Week",
    Month = "Month",
    Year = "year",
    All = "All"
}
declare enum Currency {
    EUR = "EUR",
    USD = "USD",
    ERG = "ERG",
    RSN = "RSN"
}
