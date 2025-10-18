/* eslint-disable @typescript-eslint/no-explicit-any */
const rs_DbName = 'rosenDatabase_1.1.5';
const rs_DbVersion = 38;
const rs_InputsStoreName = 'inputBoxes';
const rs_PerfTxStoreName = 'perfTxs';
const rs_PermitTxStoreName = 'permitTxs';
const rs_ActivePermitTxStoreName = 'activePermitTxs';
const rs_DownloadStatusStoreName = 'downloadStatusStore';
const rs_OpenBoxesStoreName = 'openBoxesStore';
const rs_AddressDataStoreName = 'addressData';
const rs_InitialNDownloads = 30;
const rs_FullDownloadsBatchSize = 400;
const rs_PerfInitialNDownloads = 10;
const rs_PerfFullDownloadsBatchSize = 40;
const rs_StartFrom = new Date('2024-01-01');
const rs_Input_Key = ['boxId', 'outputAddress'];
const rs_Permit_Key = 'id';
const rs_ActivePermit_Key = 'id';
const rs_PerfTx_Key = 'id';
const rs_Address_Key = 'address';
const rs_PermitCost = 3000;
const rs_WatcherCollateralRSN = 30000;
const rs_WatcherCollateralERG = 800;
const rs_ErgoExplorerHost = 'api.ergoplatform.com';
const rs_ErgoNodeHost = 'node-p2p.ergoplatform.com';
//const rs_ErgoExplorerHost = 'node-p2p.ergoplatform.com';
// https://node-p2p.ergoplatform.com/swagger
/*

https://api.ergoplatform.com/api/v1/docs/
https://api-p2p.ergoplatform.com/api/v1/docs/
https://api.ergo.aap.cornell.edu/api/v1/docs/
https://api.ergobackup.aap.cornell.edu/api/v1/docs/
https://api.codeutxo.com/api/v1/docs/

*/
const rs_RSNTokenId = '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';
const rs_eRSNTokenId = 'dede2cf5c1a2966453ffec198a9b97b53d281e548903a905519b3525d59cdc3c';
const rs_TokenIdMap = {
    [rs_RSNTokenId]: 'RSN',
    [rs_eRSNTokenId]: 'eRSN',
};
const rs_RSNDecimals = 3;
var Period;
(function (Period) {
    Period["Day"] = "Day";
    Period["Week"] = "Week";
    Period["Month"] = "Month";
    Period["Year"] = "year";
    Period["All"] = "All";
})(Period || (Period = {}));
var Currency;
(function (Currency) {
    Currency["EUR"] = "EUR";
    Currency["USD"] = "USD";
    Currency["ERG"] = "ERG";
    Currency["RSN"] = "RSN";
})(Currency || (Currency = {}));
if (typeof window !== 'undefined') {
    window.rs_DbName = rs_DbName;
    window.rs_DbVersion = rs_DbVersion;
    window.rs_InputsStoreName = rs_InputsStoreName;
    window.rs_PerfTxStoreName = rs_PerfTxStoreName;
    window.rs_PermitTxStoreName = rs_PermitTxStoreName;
    window.rs_ActivePermitTxStoreName = rs_ActivePermitTxStoreName;
    window.rs_DownloadStatusStoreName = rs_DownloadStatusStoreName;
    window.rs_OpenBoxesStoreName = rs_OpenBoxesStoreName;
    window.rs_AddressDataStoreName = rs_AddressDataStoreName;
    window.rs_InitialNDownloads = rs_InitialNDownloads;
    window.rs_FullDownloadsBatchSize = rs_FullDownloadsBatchSize;
    window.rs_StartFrom = rs_StartFrom;
    window.rs_Input_Key = rs_Input_Key;
    window.rs_PerfTx_Key = rs_PerfTx_Key;
    window.rs_Permit_Key = rs_Permit_Key;
    window.rs_ActivePermit_Key = rs_ActivePermit_Key;
    window.rs_Address_Key = rs_Address_Key;
    window.rs_PermitCost = rs_PermitCost;
    window.rs_WatcherCollateralRSN = rs_WatcherCollateralRSN;
    window.rs_WatcherCollateralERG = rs_WatcherCollateralERG;
    window.Period = Period;
    window.Currency = Currency;
    window.rs_PerfInitialNDownloads = rs_PerfInitialNDownloads;
    window.rs_PerfFullDownloadsBatchSize = rs_PerfFullDownloadsBatchSize;
    window.rs_ErgoExplorerHost = rs_ErgoExplorerHost;
    window.rs_ErgoNodeHost = rs_ErgoNodeHost;
    window.rs_RSNTokenId = rs_RSNTokenId;
    window.rs_eRSNTokenId = rs_eRSNTokenId;
    window.rs_TokenIdMap = rs_TokenIdMap;
    window.rs_RSNDecimals = rs_RSNDecimals;
}
