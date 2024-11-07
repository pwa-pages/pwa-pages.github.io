import type { ChainType } from './chaintype';

export class Address {
  address: string;
  Address: string;
  chainType: ChainType | null;

  constructor(address: string, chainType: ChainType) {
    this.address = address;
    this.Address = address;
    this.chainType = chainType;
  }
}
