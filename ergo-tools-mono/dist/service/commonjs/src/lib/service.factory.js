"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const download_service_1 = require("./download.service");
const memory_storage_service_1 = require("./memory.storage.service");
const permits_data_service_1 = require("./permits.data.service");
const watcher_data_service_1 = require("./watcher.data.service");
const constants_1 = require("./constants");
const chain_service_1 = require("./chain.service");
globalThis.GetPermitTriggerAddresses =
    () => {
        return chain_service_1.permitTriggerAddresses;
    };
globalThis.CreatePermitsDownloadService = (maxDownloadDateDifference, eventSender) => {
    var storageService = new memory_storage_service_1.MemoryStorageService();
    const permitsDataService = new permits_data_service_1.PermitsDataService(storageService, constants_1.rs_ActivePermitTxStoreName, maxDownloadDateDifference);
    return new download_service_1.DownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, permitsDataService, eventSender, null);
};
globalThis.CreateWatcherDownloadService = (maxDownloadDateDifference, eventSender) => {
    var storageService = new memory_storage_service_1.MemoryStorageService();
    const permitsDataService = new permits_data_service_1.PermitsDataService(storageService, constants_1.rs_ActivePermitTxStoreName, maxDownloadDateDifference);
    const watcherDataService = new watcher_data_service_1.WatcherDataService(permitsDataService);
    return new download_service_1.DownloadService(constants_1.rs_FullDownloadsBatchSize, constants_1.rs_InitialNDownloads, watcherDataService, eventSender, null);
};
