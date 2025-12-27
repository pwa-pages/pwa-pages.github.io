"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Output = void 0;
class Output {
    outputAddress;
    outputDate;
    boxId;
    assets;
    constructor(boxId, outputDate, assets, outputAddress) {
        this.outputAddress = outputAddress;
        this.outputDate = outputDate;
        this.assets = assets;
        this.boxId = boxId;
    }
}
exports.Output = Output;
