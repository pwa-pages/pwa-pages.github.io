import { DownloadService } from "./download.service";
import { MemoryStorageService } from "./memory.storage.service";
import { PermitsDataService } from "./permits.data.service";
import { WatcherDataService } from "./watcher.data.service";
import { rs_ActivePermitTxStoreName, rs_FullDownloadsBatchSize, rs_InitialNDownloads } from "./constants";
import { permitTriggerAddresses } from "./chain.service";
export const GetPermitTriggerAddresses = () => {
    return permitTriggerAddresses;
};
export function CreatePermitsDownloadService(maxDownloadDateDifference, eventSender) {
    var storageService = new MemoryStorageService();
    const permitsDataService = new PermitsDataService(storageService, rs_ActivePermitTxStoreName, maxDownloadDateDifference);
    return new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, permitsDataService, eventSender, null);
}
export const CreateWatcherDownloadService = (maxDownloadDateDifference, eventSender) => {
    var storageService = new MemoryStorageService();
    const permitsDataService = new PermitsDataService(storageService, rs_ActivePermitTxStoreName, maxDownloadDateDifference);
    const watcherDataService = new WatcherDataService(permitsDataService);
    return new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, watcherDataService, eventSender, null);
};
//# sourceMappingURL=service.factory.js.map