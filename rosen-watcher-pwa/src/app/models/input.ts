import { ChainType } from '../service/chain.service';
import { Asset } from './asset';

export class Input {
  outputAddress?: string;
  inputDate: Date;
  boxId?: string;
  assets: Asset[];
  outputCreatedAt: number;
  address: string;
  accumulatedAmount?: number;
  amount?: number;
  chainType?: ChainType | null;

  constructor(
    inputDate: Date,
    address: string,
    outputCreatedAt: number,
    assets: Asset[],
    outputAddress?: string,
    boxId?: string,
    accumulatedAmount?: number,
    amount?: number,
    chainType?: ChainType | null,
  ) {
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
