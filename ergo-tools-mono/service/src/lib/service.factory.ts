

(globalThis as any).CreateActivePermitsDownloadService = (
  maxDownloadDateDifference: number,
  eventSender: EventSender
): DownloadService<PermitTx> => {

  var storageService = new MemoryStorageService<PermitTx>();
  const activepermitsDataService: ActivePermitsDataService =
    new ActivePermitsDataService(storageService, maxDownloadDateDifference);

  return new DownloadService<PermitTx>(
    rs_FullDownloadsBatchSize,
    rs_InitialNDownloads,
    activepermitsDataService,
    eventSender,
    null,
  );
};



(globalThis as any).CreateWatcherDownloadService = (
  maxDownloadDateDifference: number,
  eventSender: EventSender
): DownloadService<PermitTx> => {

    
  var storageService = new MemoryStorageService<PermitTx>();

const activepermitsDataService: ActivePermitsDataService =
    new ActivePermitsDataService(storageService, maxDownloadDateDifference);

  const watcherDataService: WatcherDataService =
    new WatcherDataService(activepermitsDataService);

  return new DownloadService<PermitTx>(
    rs_FullDownloadsBatchSize,
    rs_InitialNDownloads,
    watcherDataService,
    eventSender,
    null,
  );

};



