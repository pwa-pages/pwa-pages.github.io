/* eslint-disable @typescript-eslint/no-explicit-any */
const rs_DbName = 'rosenDatabase_1.1.5';
const rs_DbVersion = 25;
const rs_InputsStoreName = 'inputBoxes';
const rs_DownloadStatusStoreName = 'downloadStatusStore';
const rs_AddressDataStoreName = 'addressData';
const rs_InitialNDownloads = 50;
const rs_FullDownloadsBatchSize = 200;
const rs_StartFrom: Date = new Date('2024-01-01');
const rs_Input_Key = ['boxId', 'outputAddress'];
const rs_Address_Key = 'address';

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

if (typeof window !== 'undefined') {
  (window as any).rs_DbName = rs_DbName;
  (window as any).rs_DbVersion = rs_DbVersion;
  (window as any).rs_InputsStoreName = rs_InputsStoreName;
  (window as any).rs_DownloadStatusStoreName = rs_DownloadStatusStoreName;
  (window as any).rs_AddressDataStoreName = rs_AddressDataStoreName;
  (window as any).rs_InitialNDownloads = rs_InitialNDownloads;
  (window as any).rs_FullDownloadsBatchSize = rs_FullDownloadsBatchSize;
  (window as any).rs_StartFrom = rs_StartFrom;
  (window as any).rs_Input_Key = rs_Input_Key;
  (window as any).rs_Address_Key = rs_Address_Key;
  (window as any).Period = Period;
}
