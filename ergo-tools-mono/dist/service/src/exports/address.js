export class Address {
    constructor(address, chainType, active = true) {
        this.active = true;
        this.address = address;
        this.Address = address;
        this.smallAddressForDisplay = address.substring(0, 6) + '...';
        this.largeAddressForDisplay =
            address.substring(0, 6) +
                '...' +
                address.substring(address.length - 6, address.length);
        this.chainType = chainType;
        this.active = active;
    }
}
//# sourceMappingURL=address.js.map