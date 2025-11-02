"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = void 0;
class Asset {
    index;
    amount;
    name;
    decimals;
    type;
    constructor(index, amount, name, decimals, type) {
        this.index = index;
        this.amount = amount;
        this.name = name;
        this.decimals = decimals;
        this.type = type;
    }
}
exports.Asset = Asset;
