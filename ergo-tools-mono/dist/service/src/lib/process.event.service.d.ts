import { IStorageService } from "./constants";
import { EventPayload, EventSender, Services } from "./service.factory";
export declare class ServiceWorkerEventSender implements EventSender {
    sendEvent<T>(event: EventPayload<T>): Promise<void>;
}
export declare enum ServiceProfile {
    MCP = 0,
    ANGULAR = 1,
    ANGULAR_ELEMENTS = 2,
    SERVICE_WORKER = 3
}
export declare class ProcessEventService {
    private eventSender;
    private storageService;
    private serviceProfile;
    services: Services | null;
    constructor(eventSender: EventSender, storageService: IStorageService, serviceProfile: ServiceProfile);
    processEvent(event: EventPayload<object>, options?: {
        throwOnError?: boolean;
    }): Promise<void>;
    private processWatcherStatsRequested;
    private processReportsRequested;
    private processRequestInputsDownload;
    private processStatisticsRequested;
    private processChainPerformanceRequested;
    private processMyWatcherStatsRequested;
    private extractChainTypes;
    private processActivePermits;
    downloadForChainPermitAddresses(addresses: string[], services: Services): Promise<void>;
    private downloadForChainPermitAddress;
    private sendPermitChangedEvent;
    private sendPermitsChangedEvent;
    downloadForActivePermitAddresses(allAddresses: string[], chainType: string, services: Services): Promise<void>;
    private downloadForActivePermitAddress;
    private sendPermitsChangedEventForAddresses;
}
export declare const CreateProcessEventService: (eventSender: EventSender, storageService: IStorageService, serviceProfile: ServiceProfile) => ProcessEventService;
export { EventSender };
