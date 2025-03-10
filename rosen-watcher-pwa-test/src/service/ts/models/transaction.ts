import type { Input } from "./input";

export class Transaction {
  constructor(
    public timestamp: number,
    public inputs: Input[],
  ) {}
}
