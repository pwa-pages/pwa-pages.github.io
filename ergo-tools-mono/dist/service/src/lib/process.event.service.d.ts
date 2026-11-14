import { EventPayload, EventSender, Services } from "./service.factory";
export declare class ServiceWorkerEventSender implements EventSender {
    sendEvent<T>(event: EventPayload<T>): Promise<void>;
}
export declare class ProcessEventService {
    private eventSender;
    constructor(eventSender: EventSender);
    processEvent(event: EventPayload<object>): Promise<void>;
    private initIndexedDB;
    private processWatchersScreenLoaded;
    private processReportsRequested;
    private processRequestInputsDownload;
    private processStatisticsScreenLoaded;
    private processPerformanceScreenLoaded;
    private processMyWatchersScreenLoaded;
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
