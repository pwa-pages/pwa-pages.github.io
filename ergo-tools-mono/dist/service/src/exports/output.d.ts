import type { Asset } from './asset';
export declare class Output {
    outputAddress: string;
    outputDate: Date;
    boxId: string;
    assets: Asset[];
    constructor(boxId: string, outputDate: Date, assets: Asset[], outputAddress: string);
}
