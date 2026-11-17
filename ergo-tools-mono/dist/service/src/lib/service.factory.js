"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageType = exports.CreateWatcherDownloadService = exports.GetPermitTriggerAddresses = void 0;
exports.initIndexedDB = initIndexedDB;
exports.CreatePermitsDownloadService = CreatePermitsDownloadService;
exports.createServices = createServices;
const chain_performance_data_service_1 = require("./chain.performance.data.service");
const chain_service_1 = require("./chain.service");
const chart_service_1 = require("./chart.service");
const constants_1 = require("./constants");
const download_service_1 = require("./download.service");
const download_status_service_1 = require("./download.status.service");
const i_db_databasestorage_service_1 = require("./i-db-databasestorage.service");
const memory_storage_service_1 = require("./memory.storage.service");
const mywatcher_data_service_1 = require("./mywatcher.data.service");
const permits_data_service_1 = require("./permits.data.service");
const price_service_1 = require("./price.service");
const reports_data_service_1 = require("./reports.data.service");
const reward_data_service_1 = require("./reward.data.service");
const transaction_download_service_1 = require("./transaction.download.service");
const watchers_data_service_1 = require("./watchers.data.service");
async function initIndexedDB() {
    return new Promise((resolve, reject) => {
        let dbName = constants_1.rs_DbName;
        const request = indexedDB.open(dbName);
        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };
        request.onerror = (event) => {
            console.error('Error opening IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}
const GetPermitTriggerAddresses = () => {
    return chain_service_1.permitTriggerAddresses;
};
exports.GetPermitTriggerAddresses = GetPermitTriggerAddresses;
function CreatePermitsDownloadService(maxDownloadDateDifference) {
    var storageService = new memory_storage_service_1.MemoryStorageService();
    const permitsDataService = new permits_data_service_1.PermitsDataService(storageService, constants_1.rs_ActivePermitTxStoreName, maxDownloadDateDifference);
    return new transaction_download_service_1.TransactionDownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, permitsDataService, null, null);
}
const CreateWatcherDownloadService = () => {
    var storageService = new memory_storage_service_1.MemoryStorageService();
    const permitsDataService = new permits_data_service_1.PermitsDataService(storageService, constants_1.rs_ActivePermitTxStoreName);
    const watcherDataService = new mywatcher_data_service_1.MyWatcherDataService(permitsDataService);
    return new transaction_download_service_1.TransactionDownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, watcherDataService, null, null);
};
exports.CreateWatcherDownloadService = CreateWatcherDownloadService;
var StorageType;
(function (StorageType) {
    StorageType[StorageType["Memory"] = 0] = "Memory";
    StorageType[StorageType["IndexedDB"] = 1] = "IndexedDB";
    StorageType[StorageType["FileSystem"] = 2] = "FileSystem";
})(StorageType || (exports.StorageType = StorageType = {}));
async function createServices(eventSender, storageType) {
    let storageService;
    let db;
    if (storageType === StorageType.IndexedDB) {
        db = await initIndexedDB();
        storageService = new i_db_databasestorage_service_1.IDBDatabaseStorageService(db);
    }
    else if (storageType === StorageType.Memory) {
        storageService = new memory_storage_service_1.MemoryStorageService();
    }
    else {
        throw new Error("Unsupported storage type");
    }
    const createDownloadStatusService = (dataService) => {
        return new download_status_service_1.DownloadStatusService(dataService, storageService);
    };
    const chartService = new chart_service_1.ChartService();
    const rewardDataService = new reward_data_service_1.RewardDataService(storageService, chartService, eventSender);
    const permitsDataService = new permits_data_service_1.PermitsDataService(storageService);
    const reportsDataService = new reports_data_service_1.ReportsDataService(storageService, eventSender);
    const myWatcherDataService = new mywatcher_data_service_1.MyWatcherDataService(permitsDataService);
    const downloadServiceWatcherInfo = new download_service_1.DownloadService(eventSender, storageService);
    const downloadServciceCurrencyRates = new download_service_1.DownloadService(eventSender, storageService);
    const priceService = new price_service_1.PriceService(downloadServciceCurrencyRates);
    const watchersDataService = new watchers_data_service_1.WatchersDataService(downloadServiceWatcherInfo, priceService, eventSender);
    const chainPerformanceDataService = new chain_performance_data_service_1.ChainPerformanceDataService(storageService, eventSender);
    const downloadStatusRewardDataService = createDownloadStatusService(rewardDataService);
    const downloadStatusWatcherDataService = createDownloadStatusService(myWatcherDataService);
    const downloadStatusPermitsDataService = createDownloadStatusService(permitsDataService);
    const downloadStatusReportsDataService = createDownloadStatusService(reportsDataService);
    const downloadStatusChainPerformanceDataService = createDownloadStatusService(chainPerformanceDataService);
    const downloadRewardService = new transaction_download_service_1.TransactionDownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, rewardDataService, eventSender, downloadStatusRewardDataService);
    const downloadMyWatchersService = new transaction_download_service_1.TransactionDownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, myWatcherDataService, eventSender, downloadStatusWatcherDataService);
    const downloadActivePermitsService = new transaction_download_service_1.TransactionDownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, permitsDataService, eventSender, downloadStatusPermitsDataService);
    const downloadReportsService = new transaction_download_service_1.TransactionDownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, reportsDataService, eventSender, downloadStatusReportsDataService);
    const downloadPerfService = new transaction_download_service_1.TransactionDownloadService(constants_1.rs_PerfFullDownloadsBatchSize, constants_1.rs_PerfInitialNDownloads, chainPerformanceDataService, eventSender, downloadStatusChainPerformanceDataService);
    return {
        dataService: rewardDataService,
        chainPerformanceDataService,
        myWatcherDataService: myWatcherDataService,
        watchersDataService: watchersDataService,
        downloadService: downloadRewardService,
        chartService,
        downloadPerfService,
        downloadMyWatchersService,
        downloadActivePermitsService,
        permitsDataService,
        reportsDataService,
        downloadReportsService,
    };
}
//# sourceMappingURL=service.factory.js.map