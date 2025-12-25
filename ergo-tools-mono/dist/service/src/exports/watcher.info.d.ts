import { Address } from './address';
import type { Token } from './token';
export declare class WatcherInfo {
    tokens: Token[];
    constructor(tokens: Token[]);
}
export declare class MyWatchersStats {
    activePermitCount: number | undefined;
    permitCount: number | undefined;
    wid: string | undefined;
    chainType: string | undefined;
    address: Address | undefined;
}
