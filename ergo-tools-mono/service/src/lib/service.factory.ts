(globalThis as any).GetPermitTriggerAddresses = 
() => {
  return permitTriggerAddresses;
}

(globalThis as any).CreatePermitsDownloadService = (
  maxDownloadDateDifference: number,
  eventSender: EventSender
): DownloadService<PermitTx> => {

  var storageService = new MemoryStorageService<PermitTx>();
  const permitsDataService: PermitsDataService =
    new PermitsDataService(storageService, rs_ActivePermitTxStoreName, maxDownloadDateDifference);

  return new DownloadService<PermitTx>(
    rs_FullDownloadsBatchSize,
    rs_InitialNDownloads,
    permitsDataService,
    eventSender,
    null,
  );
};



(globalThis as any).CreateWatcherDownloadService = (
  maxDownloadDateDifference: number,
  eventSender: EventSender
): DownloadService<PermitTx> => {

    
  var storageService = new MemoryStorageService<PermitTx>();

const permitsDataService: PermitsDataService =
    new PermitsDataService(storageService, rs_ActivePermitTxStoreName,  maxDownloadDateDifference);

  const watcherDataService: WatcherDataService =
    new WatcherDataService(permitsDataService);

  return new DownloadService<PermitTx>(
    rs_FullDownloadsBatchSize,
    rs_InitialNDownloads,
    watcherDataService,
    eventSender,
    null,
  );

};



