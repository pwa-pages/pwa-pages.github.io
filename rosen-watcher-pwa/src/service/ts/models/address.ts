import type { ChainType } from './chaintype';

export class Address {
  address: string;
  Address: string;
  active = true;
  chainType: ChainType | null | undefined;
  smallAddressForDisplay: string;
  largeAddressForDisplay: string;

  constructor(address: string, chainType: ChainType | null | undefined, active = true) {
    this.address = address;
    this.Address = address;
    this.smallAddressForDisplay = address.substring(0, 6) + '...';
    this.largeAddressForDisplay =
      address.substring(0, 6) + '...' + address.substring(address.length - 6, address.length);

    this.chainType = chainType;
    this.active = active;
  }
}
