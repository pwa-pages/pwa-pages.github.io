import { DownloadService } from "./download.service";
import { MemoryStorageService } from "./memory.storage.service";
import { EventSender } from "./process.event.service";
import { PermitsDataService } from "./permits.data.service";
import { WatcherDataService } from "./watcher.data.service";
import { PermitTx } from "./data.service";
import { rs_ActivePermitTxStoreName, rs_FullDownloadsBatchSize, rs_InitialNDownloads } from "./constants";
import { permitTriggerAddresses } from "./chain.service";

export const GetPermitTriggerAddresses = () => {
  return permitTriggerAddresses;
};

export function CreatePermitsDownloadService(
  maxDownloadDateDifference: number,
  eventSender: EventSender
): DownloadService<PermitTx> {

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
}

export const CreateWatcherDownloadService = (
  maxDownloadDateDifference: number,
  eventSender: EventSender
): DownloadService<PermitTx> => {


  var storageService = new MemoryStorageService<PermitTx>();

  const permitsDataService: PermitsDataService =
    new PermitsDataService(storageService, rs_ActivePermitTxStoreName, maxDownloadDateDifference);

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



