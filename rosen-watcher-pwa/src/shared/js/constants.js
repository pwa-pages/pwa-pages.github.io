/* eslint-disable @typescript-eslint/no-explicit-any */
const rs_DbName = 'rosenDatabase_1.1.5';
const rs_DbVersion = 28;
const rs_InputsStoreName = 'inputBoxes';
const rs_PerfTxStoreName = 'perfTxs';
const rs_DownloadStatusStoreName = 'downloadStatusStore';
const rs_AddressDataStoreName = 'addressData';
const rs_InitialNDownloads = 50;
const rs_FullDownloadsBatchSize = 400;
const rs_PerfInitialNDownloads = 10;
const rs_PerfFullDownloadsBatchSize = 40;
const rs_StartFrom = new Date('2024-01-01');
const rs_Input_Key = ['boxId', 'outputAddress'];
const rs_PerfTx_Key = 'id';
const rs_Address_Key = 'address';
const rs_PermitCost = 3000;
const rs_WatcherCollateralRSN = 30000;
const rs_WatcherCollateralERG = 800;
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
    window.rs_DownloadStatusStoreName = rs_DownloadStatusStoreName;
    window.rs_AddressDataStoreName = rs_AddressDataStoreName;
    window.rs_InitialNDownloads = rs_InitialNDownloads;
    window.rs_FullDownloadsBatchSize = rs_FullDownloadsBatchSize;
    window.rs_StartFrom = rs_StartFrom;
    window.rs_Input_Key = rs_Input_Key;
    window.rs_PerfTx_Key = rs_PerfTx_Key;
    window.rs_Address_Key = rs_Address_Key;
    window.rs_PermitCost = rs_PermitCost;
    window.rs_WatcherCollateralRSN = rs_WatcherCollateralRSN;
    window.rs_WatcherCollateralERG = rs_WatcherCollateralERG;
    window.Period = Period;
    window.Currency = Currency;
    window.rs_PerfInitialNDownloads = rs_PerfInitialNDownloads;
    window.rs_PerfFullDownloadsBatchSize = rs_PerfFullDownloadsBatchSize;
}
