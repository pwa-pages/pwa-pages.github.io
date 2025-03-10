import { Injectable } from '@angular/core';
import '../../shared/ts/chain.service';

@Injectable({
  providedIn: 'root',
})
export class ChainService {
  getChainType(address: string) {
    return getChainType(address);
  }
}
