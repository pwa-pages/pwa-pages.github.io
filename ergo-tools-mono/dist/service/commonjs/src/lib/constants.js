"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Currency = exports.Period = exports.rs_RSNDecimals = exports.rs_TokenIdMap = exports.rs_eRSNTokenId = exports.rs_RSNTokenId = exports.getUrlConfig = exports.urlConfig = exports.UrlAction = exports.rs_ErgoNodeHost = exports.rs_ErgoExplorerHost = exports.rs_WatcherCollateralERG = exports.rs_WatcherCollateralRSN = exports.rs_PermitCost = exports.rs_Address_Key = exports.rs_PerfTx_Key = exports.rs_ActivePermit_Key = exports.rs_WatcherReports_Key = exports.rs_Permit_Key = exports.rs_Input_Key = exports.rs_StartFrom = exports.rs_PerfFullDownloadsBatchSize = exports.rs_PerfInitialNDownloads = exports.rs_FullDownloadsBatchSize = exports.rs_InitialNDownloads = exports.rs_AddressDataStoreName = exports.rs_OpenBoxesStoreName = exports.rs_DownloadStatusStoreName = exports.rs_WatcherReportsStoreName = exports.rs_ReportsStoreName = exports.rs_ActivePermitTxStoreName = exports.rs_PermitTxStoreName = exports.rs_PerfTxStoreName = exports.rs_InputsStoreName = exports.rs_DbVersion = exports.rs_DbName = void 0;
const chain_service_1 = require("./chain.service");
/* eslint-disable @typescript-eslint/no-explicit-any */
exports.rs_DbName = 'rosenDatabase_1.1.5';
exports.rs_DbVersion = 52;
exports.rs_InputsStoreName = 'inputBoxes';
exports.rs_PerfTxStoreName = 'perfTxs';
exports.rs_PermitTxStoreName = 'permitTxs';
exports.rs_ActivePermitTxStoreName = 'activePermitTxs';
exports.rs_ReportsStoreName = 'reportsStore';
exports.rs_WatcherReportsStoreName = 'watcherReports';
exports.rs_DownloadStatusStoreName = 'downloadStatusStore';
exports.rs_OpenBoxesStoreName = 'openBoxesStore';
exports.rs_AddressDataStoreName = 'addressData';
exports.rs_InitialNDownloads = 30;
exports.rs_FullDownloadsBatchSize = 400;
exports.rs_PerfInitialNDownloads = 10;
exports.rs_PerfFullDownloadsBatchSize = 40;
exports.rs_StartFrom = new Date('2024-01-01');
exports.rs_Input_Key = ['boxId', 'outputAddress'];
exports.rs_Permit_Key = 'id';
exports.rs_WatcherReports_Key = 'chainType';
exports.rs_ActivePermit_Key = 'id';
exports.rs_PerfTx_Key = 'id';
exports.rs_Address_Key = 'address';
exports.rs_PermitCost = 3000;
const rs_WatcherCollateralRSN = (chainType) => {
    if (chainType === chain_service_1.ChainType.Runes || chainType === chain_service_1.ChainType.Firo) {
        return 50000;
    }
    else {
        return 30000;
    }
};
exports.rs_WatcherCollateralRSN = rs_WatcherCollateralRSN;
const rs_WatcherCollateralERG = (chainType) => {
    if (chainType === chain_service_1.ChainType.Runes || chainType === chain_service_1.ChainType.Firo) {
        return 10;
    }
    else {
        return 800;
    }
};
exports.rs_WatcherCollateralERG = rs_WatcherCollateralERG;
exports.rs_ErgoExplorerHost = 'api.ergoplatform.com';
exports.rs_ErgoNodeHost = 'https://node-p2p.ergoplatform.com';
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
var UrlAction;
(function (UrlAction) {
    UrlAction["StatisticsTransactions"] = "statisticsTransactions";
    UrlAction["ChainPerformanceTransactions"] = "chainPerformanceTransactions";
    UrlAction["WatchersBalance"] = "watchersBalance";
    UrlAction["PermitTransactions"] = "permitTransactions";
    UrlAction["PermitTriggerTransactions"] = "permitTriggerTransactions";
    UrlAction["PermitBulkTransactions"] = "permitBulkTransactions";
})(UrlAction || (exports.UrlAction = UrlAction = {}));
exports.urlConfig = {
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
const getUrlConfig = (key) => exports.urlConfig[key][0];
exports.getUrlConfig = getUrlConfig;
exports.rs_RSNTokenId = '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';
exports.rs_eRSNTokenId = 'dede2cf5c1a2966453ffec198a9b97b53d281e548903a905519b3525d59cdc3c';
exports.rs_TokenIdMap = {
    [exports.rs_RSNTokenId]: 'RSN',
    [exports.rs_eRSNTokenId]: 'eRSN',
};
exports.rs_RSNDecimals = 3;
var Period;
(function (Period) {
    Period["Day"] = "Day";
    Period["Week"] = "Week";
    Period["Month"] = "Month";
    Period["Year"] = "year";
    Period["All"] = "All";
})(Period || (exports.Period = Period = {}));
var Currency;
(function (Currency) {
    Currency["EUR"] = "EUR";
    Currency["USD"] = "USD";
    Currency["ERG"] = "ERG";
    Currency["RSN"] = "RSN";
})(Currency || (exports.Currency = Currency = {}));
globalThis.rs_DbName = exports.rs_DbName;
globalThis.rs_DbVersion = exports.rs_DbVersion;
globalThis.rs_InputsStoreName = exports.rs_InputsStoreName;
globalThis.rs_PerfTxStoreName = exports.rs_PerfTxStoreName;
globalThis.rs_PermitTxStoreName = exports.rs_PermitTxStoreName;
globalThis.rs_ReportsStoreName = exports.rs_ReportsStoreName;
globalThis.rs_ActivePermitTxStoreName = exports.rs_ActivePermitTxStoreName;
globalThis.rs_DownloadStatusStoreName = exports.rs_DownloadStatusStoreName;
globalThis.rs_OpenBoxesStoreName = exports.rs_OpenBoxesStoreName;
globalThis.rs_AddressDataStoreName = exports.rs_AddressDataStoreName;
globalThis.rs_InitialNDownloads = exports.rs_InitialNDownloads;
globalThis.rs_FullDownloadsBatchSize = exports.rs_FullDownloadsBatchSize;
globalThis.rs_StartFrom = exports.rs_StartFrom;
globalThis.rs_Input_Key = exports.rs_Input_Key;
globalThis.rs_PerfTx_Key = exports.rs_PerfTx_Key;
globalThis.rs_Permit_Key = exports.rs_Permit_Key;
globalThis.rs_WatcherReports_Key = exports.rs_WatcherReports_Key;
globalThis.rs_ActivePermit_Key = exports.rs_ActivePermit_Key;
globalThis.rs_Address_Key = exports.rs_Address_Key;
globalThis.rs_WatcherReportsStoreName = exports.rs_WatcherReportsStoreName;
globalThis.rs_PermitCost = exports.rs_PermitCost;
globalThis.rs_WatcherCollateralRSN = exports.rs_WatcherCollateralRSN;
globalThis.rs_WatcherCollateralERG = exports.rs_WatcherCollateralERG;
globalThis.rs_PerfInitialNDownloads = exports.rs_PerfInitialNDownloads;
globalThis.rs_PerfFullDownloadsBatchSize = exports.rs_PerfFullDownloadsBatchSize;
globalThis.rs_ErgoExplorerHost = exports.rs_ErgoExplorerHost;
globalThis.rs_ErgoNodeHost = exports.rs_ErgoNodeHost;
globalThis.rs_RSNTokenId = exports.rs_RSNTokenId;
globalThis.rs_eRSNTokenId = exports.rs_eRSNTokenId;
globalThis.rs_TokenIdMap = exports.rs_TokenIdMap;
globalThis.rs_RSNDecimals = exports.rs_RSNDecimals;
globalThis.currencies = Object.values(Currency);
globalThis.urlConfig = exports.urlConfig;
if (typeof window !== 'undefined') {
    window.Period = Period;
    window.Currency = Currency;
}
