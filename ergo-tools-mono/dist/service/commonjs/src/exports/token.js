"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
class Token {
    tokenId;
    amount;
    decimals;
    name;
    tokenType;
    constructor(tokenId, amount, decimals, name, tokenType) {
        this.tokenId = tokenId;
        this.amount = amount;
        this.decimals = decimals;
        this.name = name;
        this.tokenType = tokenType;
    }
}
exports.Token = Token;
