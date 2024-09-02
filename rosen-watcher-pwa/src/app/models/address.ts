import { ChainType } from "../service/chain.service";

export class Address {
  address: string;
  chainType: ChainType | null;

  constructor(address: string, chainType: ChainType) {
    this.address = address;
    this.chainType = chainType;
  }
}
