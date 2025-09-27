/* eslint-disable @typescript-eslint/no-explicit-any */
const rs_DbName = 'rosenDatabase_1.1.5';
const rs_DbVersion = 34;
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
const rs_StartFrom: Date = new Date('2024-01-01');
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

const rs_RSNTokenId = '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';
const rs_eRSNTokenId = 'dede2cf5c1a2966453ffec198a9b97b53d281e548903a905519b3525d59cdc3c';

const rs_TokenIdMap: Record<string, string> = {
  [rs_RSNTokenId]: 'RSN',
  [rs_eRSNTokenId]: 'eRSN',
};

const rs_RSNDecimals = 3;

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
  (window as any).rs_PermitTxStoreName = rs_PermitTxStoreName;
  (window as any).rs_ActivePermitTxStoreName = rs_ActivePermitTxStoreName;
  (window as any).rs_DownloadStatusStoreName = rs_DownloadStatusStoreName;
  (window as any).rs_OpenBoxesStoreName = rs_OpenBoxesStoreName;
  (window as any).rs_AddressDataStoreName = rs_AddressDataStoreName;
  (window as any).rs_InitialNDownloads = rs_InitialNDownloads;
  (window as any).rs_FullDownloadsBatchSize = rs_FullDownloadsBatchSize;
  (window as any).rs_StartFrom = rs_StartFrom;
  (window as any).rs_Input_Key = rs_Input_Key;
  (window as any).rs_PerfTx_Key = rs_PerfTx_Key;
  (window as any).rs_Permit_Key = rs_Permit_Key;
  (window as any).rs_ActivePermit_Key = rs_ActivePermit_Key;
  (window as any).rs_Address_Key = rs_Address_Key;
  (window as any).rs_PermitCost = rs_PermitCost;
  (window as any).rs_WatcherCollateralRSN = rs_WatcherCollateralRSN;
  (window as any).rs_WatcherCollateralERG = rs_WatcherCollateralERG;
  (window as any).Period = Period;
  (window as any).Currency = Currency;
  (window as any).rs_PerfInitialNDownloads = rs_PerfInitialNDownloads;
  (window as any).rs_PerfFullDownloadsBatchSize = rs_PerfFullDownloadsBatchSize;
  (window as any).rs_ErgoExplorerHost = rs_ErgoExplorerHost;
  (window as any).rs_ErgoNodeHost = rs_ErgoNodeHost;
  (window as any).rs_RSNTokenId = rs_RSNTokenId;
  (window as any).rs_eRSNTokenId = rs_eRSNTokenId;
  (window as any).rs_TokenIdMap = rs_TokenIdMap;
  (window as any).rs_RSNDecimals = rs_RSNDecimals;
}
