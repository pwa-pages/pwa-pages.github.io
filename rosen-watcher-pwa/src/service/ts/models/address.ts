import type { ChainType } from './chaintype';

export class Address {
  address: string;
  Address: string;
  chainType: ChainType | null | undefined;

  constructor(address: string, chainType: ChainType | null | undefined) {
    this.address = address;
    this.Address = address;
    this.chainType = chainType;
  }
}
