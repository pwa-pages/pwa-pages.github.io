"use strict";
globalThis.CreateActivePermitsDownloadService = (maxDownloadDateDifference, eventSender) => {
    var storageService = new MemoryStorageService();
    const activepermitsDataService = new ActivePermitsDataService(storageService, maxDownloadDateDifference);
    return new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, activepermitsDataService, eventSender, null);
};
globalThis.CreateWatcherDownloadService = (maxDownloadDateDifference, eventSender) => {
    var storageService = new MemoryStorageService();
    const activepermitsDataService = new ActivePermitsDataService(storageService, maxDownloadDateDifference);
    const watcherDataService = new WatcherDataService(activepermitsDataService);
    return new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, watcherDataService, eventSender, null);
};
//# sourceMappingURL=service.factory.js.map