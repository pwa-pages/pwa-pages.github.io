import { ChainType } from './chaintype';

export class Address {
  address: string;
  chainType: ChainType | null;

  constructor(address: string, chainType: ChainType) {
    this.address = address;
    this.chainType = chainType;
  }
}
