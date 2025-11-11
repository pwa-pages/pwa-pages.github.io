// @ts-nocheck
import { CurrencyEnum, EvtPayload, EvtSender, getActivatedChainTypes, getRewardAddressForChainType } from '@ergo-tools/service';
import { getAllChainTypes } from '@ergo-tools/service';
import { getChainTypeForAddress } from '@ergo-tools/service';
import { createProcessEvtService } from '@ergo-tools/service';


export class ChainTypeHelper {
    static getActiveChainTypes(): string[] {
        return getActivatedChainTypes();
    }

    static getAllChainTypes(): string[] {
        return getAllChainTypes();
    }

    static getChainType(address: string): string | null | undefined {
        return getChainTypeForAddress(address);
    }

    static getChainType(address: string): string | null | undefined {
        return getChainTypeForAddress(address);
    }

    static getRewardAddress(chainType: string): string | null | undefined {
        return getRewardAddressForChainType(chainType)
    }

}

export const createProcessEventService = createProcessEvtService;
export type EventPayload<T> = EvtPayload<T>;
export type EventSender = EvtSender;