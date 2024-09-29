export class Asset {
    tokenId;
    index;
    amount;
    name;
    decimals;
    type;
    constructor(tokenId, index, amount, name, decimals, type) {
        this.tokenId = tokenId;
        this.index = index;
        this.amount = amount;
        this.name = name;
        this.decimals = decimals;
        this.type = type;
    }
}
