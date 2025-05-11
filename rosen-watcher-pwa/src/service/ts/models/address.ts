import type { ChainType } from './chaintype';

export class Address {
  address: string;
  Address: string;
  active = true;
  chainType: ChainType | null | undefined;
  addressForDisplay: string;

  constructor(address: string, chainType: ChainType | null | undefined, active = true) {
    this.address = address;
    this.Address = address;
    this.addressForDisplay = address.substring(0, 6) + '...';
    this.chainType = chainType;
    this.active = active;
  }
}
