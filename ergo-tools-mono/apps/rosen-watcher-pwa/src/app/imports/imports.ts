// @ts-nocheck
import { CurrencyEnum, EvtPayload, EvtSender, getActivatedChainTypes, getChainTypeTokensByChainType, getChainTypeWatcherIdentifiersByChainType, getCurrencyValues, getPermitAddressesByChainType, getPermitBulkAddressesByChainType, getPermitTriggerAddressesByChainType, getRewardAddressForChainType } from '@ergo-tools/service';
import { getAllChainTypes } from '@ergo-tools/service';
import { getChainTypeForAddress } from '@ergo-tools/service';
import { createProcessEvtService } from '@ergo-tools/service';


export class ChainTypeHelper {

    static isChainTypeActive(chainType: string): bool {
        return getActivatedChainTypes().includes(chainType);
    }

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
    static getPermitAddresses(): Record<string, string | null> {
        return getPermitAddressesByChainType()
    }

    static getPermitTriggerAddresses(): Record<string, string | null> {
        return getPermitTriggerAddressesByChainType()
    }

    static getPermitBulkAddresses(): Record<string, string | null> {
        return getPermitBulkAddressesByChainType()
    }


    static getChainTypeTokens(): Record<string, string | null> {
        return getChainTypeTokensByChainType()
    }

    static getChainTypeWatcherIdentifiers(): Record<string, string | null> {
        return getChainTypeWatcherIdentifiersByChainType()
    }



}

export const getCurrencies = getCurrencyValues;

export const createProcessEventService = createProcessEvtService;
export type EventPayload<T> = EvtPayload<T>;
export type EventSender = EvtSender;