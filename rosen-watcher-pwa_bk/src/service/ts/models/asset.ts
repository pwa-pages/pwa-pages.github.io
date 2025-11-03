export class Asset {
  index: number;
  amount: number;
  name: string;
  decimals: number;
  type: string;

  constructor(index: number, amount: number, name: string, decimals: number, type: string) {
    this.index = index;
    this.amount = amount;
    this.name = name;
    this.decimals = decimals;
    this.type = type;
  }
}
