export interface IProcessEventService {
    processEvent(event: EvtPayload<object>): Promise<void>;
}
export interface EvtPayload<T> {
    type: string;
    data?: T;
}
export interface EvtSender {
    sendEvent<T>(event: EvtPayload<T>): Promise<void>;
}
export declare function createProcessEvtService(eventSender: EvtSender): IProcessEventService;
