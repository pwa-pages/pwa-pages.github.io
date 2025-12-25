import type { Asset } from './asset';

export class Output {
  outputAddress: string;
  outputDate: Date;
  boxId: string;
  assets: Asset[];


  constructor(
    boxId: string,
    outputDate: Date,
    assets: Asset[],
    outputAddress: string
  ) {
    this.outputAddress = outputAddress;
    this.outputDate = outputDate;
    this.assets = assets;
    this.boxId = boxId;

  }
}
