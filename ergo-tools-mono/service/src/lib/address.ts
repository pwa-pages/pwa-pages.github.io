export class Address {
  address: string;
  Address: string;
  active = true;
  chainType: string | null | undefined;
  smallAddressForDisplay: string;
  largeAddressForDisplay: string;
  ownAddress?: boolean;

  constructor(
    address: string,
    chainType: string | null | undefined,
    active = true,
    ownAddress: boolean = false,
  ) {
    this.address = address;
    this.Address = address;
    this.smallAddressForDisplay = address.substring(0, 6) + '...';
    this.largeAddressForDisplay =
      address.substring(0, 6) +
      '...' +
      address.substring(address.length - 6, address.length);

    this.chainType = chainType;
    this.active = active;
    this.ownAddress = ownAddress;
  }
}
