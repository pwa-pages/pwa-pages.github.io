import { Asset } from './asset';
export interface PermitTx {
  id: string;
  date: Date;
  boxId: string;
  assets: Asset[];
  address: string;
  chainType?: string;
  wid: string;
  transactionId: string;
}
