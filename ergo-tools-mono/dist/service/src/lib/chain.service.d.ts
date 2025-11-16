declare enum ChainType {
    Ergo = "Ergo",
    Cardano = "Cardano",
    Bitcoin = "Bitcoin",
    Ethereum = "Ethereum",
    Binance = "Binance",
    Doge = "Doge",
    Runes = "Runes",
    Nervos = "Nervos",
    Handshake = "Handshake",
    Firo = "Firo",
    Monero = "Monero"
}
declare function getChainTypes(): string[];
declare function getActiveChainTypes(): ChainType[];
declare const chainTypeTokens: {
    [k: string]: string;
};
declare const chainTypeWatcherIdentifier: {
    [k: string]: string;
};
declare const rwtTokenIds: Record<string, ChainType>;
declare const permitAddresses: Record<ChainType, string | null>;
declare const permitTriggerAddresses: Record<ChainType, string | null>;
declare const permitBulkAddresses: Record<ChainType, string | null>;
declare const rewardAddresses: Record<ChainType, string | null>;
declare const hotWalletAddress = "nB3L2PD3J4rMmyGk7nnNdESpPXxhPRQ4t1chF8LTXtceMQjKCEgL2pFjPY6cehGjyEFZyHEomBTFXZyqfonvxDozrTtK5JzatD8SdmcPeJNWPvdRb5UxEMXE4WQtpAFzt2veT8Z6bmoWN";
/**
 * Determines the ChainType based on the provided address.
 * @param address The address to evaluate.
 * @returns The corresponding ChainType or null if not found.
 */
declare function getChainType(address?: string): ChainType | null | undefined;
declare function getChainTypeForPermitAddress(address?: string): ChainType | null | undefined;
