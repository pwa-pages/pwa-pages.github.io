import type { Asset } from './asset';
export declare class Input {
    outputAddress: string;
    inputDate: Date;
    boxId: string;
    assets: Asset[];
    outputCreatedAt: number;
    address: string;
    accumulatedAmount?: number;
    amount?: number;
    chainType?: string | null;
    constructor(inputDate: Date, address: string, outputCreatedAt: number, assets: Asset[], outputAddress: string, boxId: string, accumulatedAmount?: number, amount?: number, chainType?: string | null);
}
