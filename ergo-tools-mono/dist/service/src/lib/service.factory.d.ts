import { DownloadService } from "./download.service";
import { EventSender } from "./process.event.service";
import { PermitTx } from "./data.service";
export declare const GetPermitTriggerAddresses: () => Record<import("./chain.service").ChainType, string | null>;
export declare function CreatePermitsDownloadService(maxDownloadDateDifference: number, eventSender: EventSender): DownloadService<PermitTx>;
export declare const CreateWatcherDownloadService: (maxDownloadDateDifference: number, eventSender: EventSender) => DownloadService<PermitTx>;
