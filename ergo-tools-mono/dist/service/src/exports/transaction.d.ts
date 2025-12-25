import type { Output } from './output';
import type { Input } from './input';
export declare class Transaction {
    timestamp: number;
    inputs: Input[];
    id: string;
    outputs: Output[];
    constructor(timestamp: number, inputs: Input[], id: string, outputs: Output[]);
}
