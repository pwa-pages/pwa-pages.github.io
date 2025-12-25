export class Asset {
  amount: number;
  name: string;
  decimals: number;
  type: string;

  constructor(
    amount: number,
    name: string,
    decimals: number,
    type: string,
  ) {
    this.amount = amount;
    this.name = name;
    this.decimals = decimals;
    this.type = type;
  }
}
