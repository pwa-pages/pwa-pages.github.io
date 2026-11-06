export declare class Address {
    address: string;
    Address: string;
    active: boolean;
    chainType: string | null | undefined;
    smallAddressForDisplay: string;
    largeAddressForDisplay: string;
    ownAddress?: boolean;
    constructor(address: string, chainType: string | null | undefined, active?: boolean, ownAddress?: boolean);
}
