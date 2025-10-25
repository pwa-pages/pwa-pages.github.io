import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private addresses: string[] = [];
  constructor(private storageService: StorageService) {}

  setAddresses(addresses: string[]): void {
    this.addresses = addresses;
  }

  async getAddresses(): Promise<string[]> {
    if (this.addresses.length > 0) {
      return this.addresses;
    }

    return (await this.storageService.getAddressData()).map((a) => a.address);
  }
}
