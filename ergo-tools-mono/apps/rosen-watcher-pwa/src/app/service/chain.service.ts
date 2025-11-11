import { Injectable } from '@angular/core';
import { ChainTypeHelper } from '../imports/imports';


@Injectable({
  providedIn: 'root',
})
export class ChainService {
  getChainType(address: string) {
    
    return ChainTypeHelper.getChainType(address);
  }
}
