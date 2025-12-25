import type { Input } from './input';
export declare class Transaction {
    timestamp: number;
    inputs: Input[];
    constructor(timestamp: number, inputs: Input[]);
}
