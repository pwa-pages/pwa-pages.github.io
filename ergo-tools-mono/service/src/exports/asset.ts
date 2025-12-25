export class Asset {
  amount: number;
  name: string;
  decimals: number;
  type: string;
  tokenId: string | null;

  constructor(
    amount: number,
    name: string,
    decimals: number,
    type: string,
    tokenId: string | null,
  ) {
    this.amount = amount;
    this.name = name;
    this.decimals = decimals;
    this.type = type;
    this.tokenId = tokenId
  }
}
