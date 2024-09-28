export class Asset {
  tokenId: string;
  index: number;
  amount: number;
  name: string;
  decimals: number;
  type: string;

  constructor(
    tokenId: string,
    index: number,
    amount: number,
    name: string,
    decimals: number,
    type: string,
  ) {
    this.tokenId = tokenId;
    this.index = index;
    this.amount = amount;
    this.name = name;
    this.decimals = decimals;
    this.type = type;
  }
}
