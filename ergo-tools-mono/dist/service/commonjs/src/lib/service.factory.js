"use strict";
globalThis.GetPermitTriggerAddresses =
    () => {
        return permitTriggerAddresses;
    };
globalThis.CreatePermitsDownloadService = (maxDownloadDateDifference, eventSender) => {
    var storageService = new MemoryStorageService();
    const permitsDataService = new PermitsDataService(storageService, maxDownloadDateDifference);
    return new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, permitsDataService, eventSender, null);
};
globalThis.CreateWatcherDownloadService = (maxDownloadDateDifference, eventSender) => {
    var storageService = new MemoryStorageService();
    const permitsDataService = new PermitsDataService(storageService, maxDownloadDateDifference);
    const watcherDataService = new WatcherDataService(permitsDataService);
    return new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, watcherDataService, eventSender, null);
};
