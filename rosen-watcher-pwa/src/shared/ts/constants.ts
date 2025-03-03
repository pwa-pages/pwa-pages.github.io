/* eslint-disable @typescript-eslint/no-explicit-any */
const rs_DbName = 'rosenDatabase_1.1.5';
const rs_DbVersion = 27;
const rs_InputsStoreName = 'inputBoxes';
const rs_PerfTxStoreName = 'perfTxs';
const rs_DownloadStatusStoreName = 'downloadStatusStore';
const rs_AddressDataStoreName = 'addressData';
const rs_InitialNDownloads = 50;
const rs_FullDownloadsBatchSize = 200;
const rs_PerfInitialNDownloads = 10;
const rs_PerfFullDownloadsBatchSize = 40;
const rs_StartFrom: Date = new Date('2024-01-01');
const rs_Input_Key = ['boxId', 'outputAddress'];
const rs_PerfTx_Key = 'id';
const rs_Address_Key = 'address';
const rs_PermitCost = 3000;
const rs_WatcherCollateralRSN = 30000;
const rs_WatcherCollateralERG = 800;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface DateNumberPoint {
  x: Date;
  y: number;
}

enum Period {
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
  Year = 'year',
  All = 'All',
}

enum Currency {
  EUR = 'EUR',
  USD = 'USD',
  ERG = 'ERG',
  RSN = 'RSN',
}

if (typeof window !== 'undefined') {
  (window as any).rs_DbName = rs_DbName;
  (window as any).rs_DbVersion = rs_DbVersion;
  (window as any).rs_InputsStoreName = rs_InputsStoreName;
  (window as any).rs_PerfTxStoreName = rs_PerfTxStoreName;
  (window as any).rs_DownloadStatusStoreName = rs_DownloadStatusStoreName;
  (window as any).rs_AddressDataStoreName = rs_AddressDataStoreName;
  (window as any).rs_InitialNDownloads = rs_InitialNDownloads;
  (window as any).rs_FullDownloadsBatchSize = rs_FullDownloadsBatchSize;
  (window as any).rs_StartFrom = rs_StartFrom;
  (window as any).rs_Input_Key = rs_Input_Key;
  (window as any).rs_PerfTx_Key = rs_PerfTx_Key;
  (window as any).rs_Address_Key = rs_Address_Key;
  (window as any).rs_PermitCost = rs_PermitCost;
  (window as any).rs_WatcherCollateralRSN = rs_WatcherCollateralRSN;
  (window as any).rs_WatcherCollateralERG = rs_WatcherCollateralERG;
  (window as any).Period = Period;
  (window as any).Currency = Currency;
  (window as any).rs_PerfInitialNDownloads = rs_PerfInitialNDownloads;
  (window as any).rs_PerfFullDownloadsBatchSize = rs_PerfFullDownloadsBatchSize;
}
