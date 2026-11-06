import { Injectable } from '@angular/core';
import { getChainType } from '@ergo-tools/service';


@Injectable({
  providedIn: 'root',
})
export class ChainService {
  getChainType(address: string) {
    
    return getChainType(address);
  }
}
