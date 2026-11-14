export declare enum ChainType {
    Ergo = "Ergo",
    Cardano = "Cardano",
    Bitcoin = "Bitcoin",
    Ethereum = "Ethereum",
    Binance = "Binance",
    Doge = "Doge",
    Runes = "Runes",
    Firo = "Firo",
    Handshake = "Handshake",
    Nervos = "Nervos",
    Base = "Base",
    Monero = "Monero",
    BitcoinCash = "BitcoinCash",
    Zcash = "Zcash"
}
export declare function getChainTypes(): string[];
export declare function getActiveChainTypes(): ChainType[];
export declare const chainTypeTokens: {
    [k: string]: string;
};
export declare const chainTypeWatcherIdentifier: {
    [k: string]: string;
};
export declare const rwtTokenIds: Record<string, ChainType>;
export declare const permitAddresses: Record<ChainType, string | null>;
export declare const permitTriggerAddresses: Record<ChainType, string | null>;
export declare const permitBulkAddresses: Record<ChainType, string | null>;
export declare const rewardAddresses: Record<ChainType, string | null>;
export declare const rewardAddressesV2: Record<ChainType, string | null>;
export declare const hotWalletAddress = "nB3L2PD3J4rMmyGk7nnNdESpPXxhPRQ4t1chF8LTXtceMQjKCEgL2pFjPY6cehGjyEFZyHEomBTFXZyqfonvxDozrTtK5JzatD8SdmcPeJNWPvdRb5UxEMXE4WQtpAFzt2veT8Z6bmoWN";
/**
 * Determines the ChainType based on the provided address.
 * @param address The address to evaluate.
 * @returns The corresponding ChainType or null if not found.
 */
export declare function getChainType(address?: string): ChainType | null | undefined;
export declare function getChainTypeForPermitAddress(address?: string): ChainType | null | undefined;
export declare function getChainTypeForPermitTriggerAddress(address?: string): ChainType | null | undefined;
