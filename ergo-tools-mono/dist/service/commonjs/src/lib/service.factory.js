"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWatcherDownloadService = exports.GetPermitTriggerAddresses = void 0;
exports.CreatePermitsDownloadService = CreatePermitsDownloadService;
exports.createServices = createServices;
const chain_performance_data_service_1 = require("./chain.performance.data.service");
const chain_service_1 = require("./chain.service");
const chart_service_1 = require("./chart.service");
const constants_1 = require("./constants");
const download_status_indexeddb_service_1 = require("./download.status.indexeddb.service");
const memory_storage_service_1 = require("./memory.storage.service");
const mywatcher_data_service_1 = require("./mywatcher.data.service");
const permits_data_service_1 = require("./permits.data.service");
const reports_data_service_1 = require("./reports.data.service");
const reward_data_service_1 = require("./reward.data.service");
const transaction_download_service_1 = require("./transaction.download.service");
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
async function createServices(eventSender, db) {
    const chartService = new chart_service_1.ChartService();
    const rewardDataService = new reward_data_service_1.RewardDataService(db, chartService, eventSender);
    const permitsDataService = new permits_data_service_1.PermitsDataService(db);
    const reportsDataService = new reports_data_service_1.ReportsDataService(db, eventSender);
    const watcherDataService = new mywatcher_data_service_1.MyWatcherDataService(permitsDataService);
    const chainPerformanceDataService = new chain_performance_data_service_1.ChainPerformanceDataService(db, eventSender);
    const downloadStatusIndexedDbRewardDataService = new download_status_indexeddb_service_1.DownloadStatusIndexedDbService(rewardDataService, db);
    const downloadStatusIndexedDbWatcherDataService = new download_status_indexeddb_service_1.DownloadStatusIndexedDbService(watcherDataService, db);
    const downloadStatusIndexedDbPermitsDataService = new download_status_indexeddb_service_1.DownloadStatusIndexedDbService(permitsDataService, db);
    const downloadStatusIndexedDbChainPerformanceDataService = new download_status_indexeddb_service_1.DownloadStatusIndexedDbService(chainPerformanceDataService, db);
    const downloadService = new transaction_download_service_1.TransactionDownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, rewardDataService, eventSender, downloadStatusIndexedDbRewardDataService);
    const downloadMyWatchersService = new transaction_download_service_1.TransactionDownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, watcherDataService, eventSender, downloadStatusIndexedDbWatcherDataService);
    const downloadActivePermitsService = new transaction_download_service_1.TransactionDownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, permitsDataService, eventSender, downloadStatusIndexedDbPermitsDataService);
    const downloadReportsService = new transaction_download_service_1.TransactionDownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, reportsDataService, eventSender, downloadStatusIndexedDbPermitsDataService);
    const downloadPerfService = new transaction_download_service_1.TransactionDownloadService(constants_1.rs_PerfFullDownloadsBatchSize, constants_1.rs_PerfInitialNDownloads, chainPerformanceDataService, eventSender, downloadStatusIndexedDbChainPerformanceDataService);
    return {
        dataService: rewardDataService,
        chainPerformanceDataService,
        watcherDataService,
        downloadService,
        chartService,
        downloadPerfService,
        downloadMyWatchersService,
        downloadActivePermitsService,
        permitsDataService,
        reportsDataService,
        downloadReportsService,
    };
}
