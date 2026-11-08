"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWatcherDownloadService = exports.GetPermitTriggerAddresses = void 0;
exports.CreatePermitsDownloadService = CreatePermitsDownloadService;
const download_service_1 = require("./download.service");
const memory_storage_service_1 = require("./memory.storage.service");
const permits_data_service_1 = require("./permits.data.service");
const mywatcher_data_service_1 = require("./mywatcher.data.service");
const constants_1 = require("./constants");
const chain_service_1 = require("./chain.service");
const GetPermitTriggerAddresses = () => {
    return chain_service_1.permitTriggerAddresses;
};
exports.GetPermitTriggerAddresses = GetPermitTriggerAddresses;
function CreatePermitsDownloadService(maxDownloadDateDifference) {
    var storageService = new memory_storage_service_1.MemoryStorageService();
    const permitsDataService = new permits_data_service_1.PermitsDataService(storageService, constants_1.rs_ActivePermitTxStoreName, maxDownloadDateDifference);
    return new download_service_1.DownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, permitsDataService, null, null);
}
const CreateWatcherDownloadService = () => {
    var storageService = new memory_storage_service_1.MemoryStorageService();
    const permitsDataService = new permits_data_service_1.PermitsDataService(storageService, constants_1.rs_ActivePermitTxStoreName);
    const watcherDataService = new mywatcher_data_service_1.MyWatcherDataService(permitsDataService);
    return new download_service_1.DownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, watcherDataService, null, null);
};
exports.CreateWatcherDownloadService = CreateWatcherDownloadService;
