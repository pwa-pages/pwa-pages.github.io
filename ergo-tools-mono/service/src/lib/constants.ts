import { ChainType } from "./chain.service";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const rs_DbName = 'rosenDatabase_1.1.5';
export const rs_DbVersion = 54;
export const rs_DownloadStoreName = 'downloads';
export const rs_InputsStoreName = 'inputBoxes';
export const rs_PerfTxStoreName = 'perfTxs';
export const rs_PermitTxStoreName = 'permitTxs';
export const rs_ActivePermitTxStoreName = 'activePermitTxs';
export const rs_ReportsStoreName = 'reportsStore';
export const rs_WatcherReportsStoreName = 'watcherReports';
export const rs_DownloadStatusStoreName = 'downloadStatusStore';
export const rs_OpenBoxesStoreName = 'openBoxesStore';
export const rs_AddressDataStoreName = 'addressData';
export const rs_InitialNDownloads = 30;
export const rs_FullDownloadsBatchSize = 400;
export const rs_PerfInitialNDownloads = 10;
export const rs_PerfFullDownloadsBatchSize = 40;
export const rs_StartFrom: Date = new Date('2024-01-01');
export const rs_Input_Key = ['boxId', 'outputAddress'];
export const rs_Download_Key = 'url';
export const rs_Permit_Key = 'id';
export const rs_WatcherReports_Key = 'chainType';
export const rs_ActivePermit_Key = 'id';
export const rs_PerfTx_Key = 'id';
export const rs_Address_Key = 'address';
export const rs_PermitCost = 3000;




export const rs_WatcherCollateralRSN = (
  chainType: string
): number => {

  if (chainType === ChainType.Runes || chainType === ChainType.Firo) {
    return 50000;
  }
  else {
    return 30000;
  }
};


export const rs_WatcherCollateralERG = (
  chainType: string
): number => {
  if (chainType === ChainType.Runes || chainType === ChainType.Firo) {
    return 10;
  }
  else {
    return 800;
  }
};



export const rs_ErgoExplorerHost = 'api.ergoplatform.com';
export const rs_ErgoNodeHost = 'https://node-p2p.ergoplatform.com';
//const rs_ErgoNodeHost = 'localhost:9053';

//const rs_ErgoExplorerHost = 'node-p2p.ergoplatform.com';
// https://node-p2p.ergoplatform.com/swagger

/*

https://explorer.ergoplatform.com/
https://explorer-p2p.ergoplatform.com/
https://ergo.aap.cornell.edu/
https://ergobackup.aap.cornell.edu/
https://explorer.codeutxo.com/
https://ergexplorer.com/
https://sigmaspace.io/
https://api.sigmaspace.io/

API's
https://api.ergoplatform.com/api/v1/docs/
https://api-p2p.ergoplatform.com/api/v1/docs/
https://api.ergo.aap.cornell.edu/api/v1/docs/
https://api.ergobackup.aap.cornell.edu/api/v1/docs/
https://api.codeutxo.com/api/v1/docs/

GraphQL
https://gql.ergoplatform.com/
https://graphql-p2p.ergoplatform.com/
https://graphql.ergo.aap.cornell.edu/
https://graphql.ergobackup.aap.cornell.edu/
https://graphql.codeutxo.com/

*/

export enum UrlAction {
  StatisticsTransactions = 'statisticsTransactions',
  ChainPerformanceTransactions = 'chainPerformanceTransactions',
  WatchersBalance = 'watchersBalance',
  PermitTransactions = 'permitTransactions',
  PermitTriggerTransactions = 'permitTriggerTransactions',
  PermitBulkTransactions = 'permitBulkTransactions',
}

export const urlConfig: Record<UrlAction, { isNode: boolean; url: string }[]> = {
  [UrlAction.StatisticsTransactions]: [
    {
      isNode: false,
      url: 'api.sigmaspace.io',
    }, {
      isNode: true,
      url: 'node-p2p.ergoplatform.com',
    },
  ],
  [UrlAction.ChainPerformanceTransactions]: [
    {
      isNode: false,
      url: 'api.sigmaspace.io',
    }, {
      isNode: true,
      url: 'node-p2p.ergoplatform.com',
    },
  ],
  [UrlAction.WatchersBalance]: [
    {
      isNode: false,
      url: 'api.ergoplatform.com',
    }, {
      isNode: true,
      url: 'node-p2p.ergoplatform.com',
    },
  ],
  [UrlAction.PermitTransactions]: [
    {
      isNode: false,
      url: 'api.sigmaspace.io',
    }, {
      isNode: true,
      url: 'node-p2p.ergoplatform.com',
    },
  ],
  [UrlAction.PermitTriggerTransactions]: [
    {
      isNode: false,
      url: 'api.sigmaspace.io',
    }, {
      isNode: true,
      url: 'node-p2p.ergoplatform.com',
    },
  ],
  [UrlAction.PermitBulkTransactions]: [
    {
      isNode: false,
      url: 'api.sigmaspace.io',
    }, {
      isNode: true,
      url: 'node-p2p.ergoplatform.com',
    },
  ]
};

export const getUrlConfig = (key: UrlAction): { isNode: boolean; url: string } =>
  urlConfig[key][0];

export const rs_RSNTokenId =
  '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';
export const rs_eRSNTokenId =
  'dede2cf5c1a2966453ffec198a9b97b53d281e548903a905519b3525d59cdc3c';

export const rs_TokenIdMap: Record<string, string> = {
  [rs_RSNTokenId]: 'RSN',
  [rs_eRSNTokenId]: 'eRSN',
};

export const rs_RSNDecimals = 3;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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


export enum Period {
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
  Year = 'year',
  All = 'All',
}

export enum Currency {
  EUR = 'EUR',
  USD = 'USD',
  ERG = 'ERG',
  RSN = 'RSN',
}

  