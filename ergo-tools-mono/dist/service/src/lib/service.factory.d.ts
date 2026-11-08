import { DownloadService } from "./download.service";
import { PermitTx } from "./models";
export declare const GetPermitTriggerAddresses: () => Record<import("./chain.service").ChainType, string | null>;
export declare function CreatePermitsDownloadService(maxDownloadDateDifference: number): DownloadService<PermitTx>;
export declare const CreateWatcherDownloadService: () => DownloadService<PermitTx>;
