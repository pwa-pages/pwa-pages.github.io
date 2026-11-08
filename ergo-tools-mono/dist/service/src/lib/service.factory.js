import { DownloadService } from "./download.service";
import { MemoryStorageService } from "./memory.storage.service";
import { PermitsDataService } from "./permits.data.service";
import { MyWatcherDataService } from "./mywatcher.data.service";
import { rs_ActivePermitTxStoreName, rs_FullDownloadsBatchSize, rs_InitialNDownloads } from "./constants";
import { permitTriggerAddresses } from "./chain.service";
export const GetPermitTriggerAddresses = () => {
    return permitTriggerAddresses;
};
export function CreatePermitsDownloadService(maxDownloadDateDifference) {
    var storageService = new MemoryStorageService();
    const permitsDataService = new PermitsDataService(storageService, rs_ActivePermitTxStoreName, maxDownloadDateDifference);
    return new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, permitsDataService, null, null);
}
export const CreateWatcherDownloadService = () => {
    var storageService = new MemoryStorageService();
    const permitsDataService = new PermitsDataService(storageService, rs_ActivePermitTxStoreName);
    const watcherDataService = new MyWatcherDataService(permitsDataService);
    return new DownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, watcherDataService, null, null);
};
//# sourceMappingURL=service.factory.js.map