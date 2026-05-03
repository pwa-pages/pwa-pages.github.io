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

export function createProcessEvtService(eventSender: EvtSender): IProcessEventService {
  return (globalThis as any).CreateProcessEventService(eventSender);
}
