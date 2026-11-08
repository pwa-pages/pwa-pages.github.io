import { DownloadService } from "./download.service";
import { MemoryStorageService } from "./memory.storage.service";
import { EventSender } from "./process.event.service";
import { PermitsDataService } from "./permits.data.service";
import { MyWatcherDataService } from "./mywatcher.data.service";
import { rs_ActivePermitTxStoreName, rs_FullDownloadsBatchSize, rs_InitialNDownloads } from "./constants";
import { permitTriggerAddresses } from "./chain.service";
import { PermitTx } from "./models";

export const GetPermitTriggerAddresses = () => {
  return permitTriggerAddresses;
};

export function CreatePermitsDownloadService(
  maxDownloadDateDifference: number
): DownloadService<PermitTx> {

  var storageService = new MemoryStorageService<PermitTx>();
  const permitsDataService: PermitsDataService =
    new PermitsDataService(storageService, rs_ActivePermitTxStoreName, maxDownloadDateDifference);

  return new DownloadService<PermitTx>(
    rs_FullDownloadsBatchSize,
    rs_InitialNDownloads,
    permitsDataService,
    null as unknown as EventSender,
    null,
  );
}

export const CreateWatcherDownloadService = (
  
): DownloadService<PermitTx> => {


  var storageService = new MemoryStorageService<PermitTx>();

  const permitsDataService: PermitsDataService =
    new PermitsDataService(storageService, rs_ActivePermitTxStoreName);

  const watcherDataService: MyWatcherDataService =
    new MyWatcherDataService(permitsDataService);

  return new DownloadService<PermitTx>(
    rs_FullDownloadsBatchSize,
    rs_InitialNDownloads,
    watcherDataService,
    null as unknown as EventSender,
    null,
  );

};



