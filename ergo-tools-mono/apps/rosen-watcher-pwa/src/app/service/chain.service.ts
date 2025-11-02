import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChainService {
  getChainType(address: string) {
    return getChainType(address);
  }
}
