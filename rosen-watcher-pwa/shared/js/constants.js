/* eslint-disable @typescript-eslint/no-explicit-any */
const rs_DbName = 'rosenDatabase_1.1.5';
const rs_DbVersion = 22;
const rs_InputsStoreName = 'inputBoxes';
const rs_DownloadStatusStoreName = 'downloadStatusStore';
const rs_AddressDataStoreName = 'addressData';
const rs_InitialNDownloads = 50;
const rs_FullDownloadsBatchSize = 200;
const rs_StartFrom = new Date('2024-01-01');
const rs_Input_Key = ['boxId', 'outputAddress'];
const rs_Address_Key = 'address';
var Period;
(function (Period) {
    Period["Day"] = "Day";
    Period["Week"] = "Week";
    Period["Month"] = "Month";
    Period["Year"] = "year";
    Period["All"] = "All";
})(Period || (Period = {}));
if (typeof window !== 'undefined') {
    window.rs_DbName = rs_DbName;
    window.rs_DbVersion = rs_DbVersion;
    window.rs_InputsStoreName = rs_InputsStoreName;
    window.rs_DownloadStatusStoreName = rs_DownloadStatusStoreName;
    window.rs_AddressDataStoreName = rs_AddressDataStoreName;
    window.rs_InitialNDownloads = rs_InitialNDownloads;
    window.rs_FullDownloadsBatchSize = rs_FullDownloadsBatchSize;
    window.rs_StartFrom = rs_StartFrom;
    window.rs_Input_Key = rs_Input_Key;
    window.rs_Address_Key = rs_Address_Key;
    window.Period = Period;
}
