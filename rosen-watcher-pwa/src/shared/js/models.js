/* eslint-disable @typescript-eslint/no-unused-vars */
class Asset {
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
class Input {
    outputAddress;
    inputDate;
    boxId;
    assets;
    outputCreatedAt;
    address;
    accumulatedAmount;
    amount;
    chainType;
    constructor(inputDate, address, outputCreatedAt, assets, outputAddress, boxId, accumulatedAmount, amount, chainType) {
        this.outputAddress = outputAddress;
        this.inputDate = inputDate;
        this.assets = assets;
        this.boxId = boxId;
        this.outputCreatedAt = outputCreatedAt;
        this.address = address;
        this.accumulatedAmount = accumulatedAmount;
        this.amount = amount;
        this.chainType = chainType;
    }
}
var ChainType;
(function (ChainType) {
    ChainType["Bitcoin"] = "Bitcoin";
    ChainType["Cardano"] = "Cardano";
    ChainType["Ergo"] = "Ergo";
})(ChainType || (ChainType = {}));
class Address {
    address;
    chainType;
    constructor(address, chainType) {
        this.address = address;
        this.chainType = chainType;
    }
}
class Transaction {
    timestamp;
    inputs;
    constructor(timestamp, inputs) {
        this.timestamp = timestamp;
        this.inputs = inputs;
    }
}
