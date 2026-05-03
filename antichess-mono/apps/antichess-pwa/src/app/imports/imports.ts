import { EvtPayload, EvtSender, createProcessEvtService } from '@antichess/service';


export type EventPayload<T> = EvtPayload<T>;
export type EventSender = EvtSender;

export const createProcessEventService = createProcessEvtService;