import { EventPayload, EventSender, Services, StorageType } from "./service.factory";
export declare class ServiceWorkerEventSender implements EventSender {
    sendEvent<T>(event: EventPayload<T>): Promise<void>;
}
export declare class ProcessEventService {
    private eventSender;
    private storageType;
    constructor(eventSender: EventSender, storageType: StorageType);
    processEvent(event: EventPayload<object>): Promise<void>;
    private processWatcherStatsRequested;
    private processReportsRequested;
    private processRequestInputsDownload;
    private processStatisticsScreenLoaded;
    private processPerformanceScreenLoaded;
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
export declare const CreateProcessEventService: (eventSender: EventSender) => ProcessEventService;
export { EventSender };
