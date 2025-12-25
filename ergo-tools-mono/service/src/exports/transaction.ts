import type { Output } from './output';
import type { Input } from './input';

export class Transaction {
  constructor(
    public timestamp: number,
    public inputs: Input[],
    public id: string,
    public outputs: Output[],
  ) {}
}
