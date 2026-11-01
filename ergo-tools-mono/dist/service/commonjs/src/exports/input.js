"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
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
exports.Input = Input;
