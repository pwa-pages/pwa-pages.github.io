"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
class Address {
    address;
    Address;
    active = true;
    chainType;
    smallAddressForDisplay;
    largeAddressForDisplay;
    constructor(address, chainType, active = true) {
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
exports.Address = Address;
