import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/data.service';
import { StorageService } from '../service/storage.service';
import { Router } from '@angular/router';
import { SettingsDialogComponent } from './settings.dialog';
import { MatDialog } from '@angular/material/dialog';
import { NgFor } from '@angular/common';
import { Address } from '../models/address';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
  standalone: true,
  imports: [NgFor],
})
export class SettingsComponent implements OnInit {
  addresses: Address[];

  constructor(
    private router: Router,
    private dataService: DataService,
    private storageService: StorageService,
    public dialog: MatDialog,
  ) {
    this.addresses = [];
  }

  trackByFn(index: number) {
    return index;
  }

  editaddress(index: number): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      data: {
        title: 'Edit Address',
        address: this.addresses[index].address,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addresses[index].address = result.address;
        const editAddress = this.addresses.find((a) => a.address == result.address);
        if (editAddress == null) {
          this.addresses.push({
            address: result.address,
          } as Address);
        }
      }
    });
  }

  addaddress(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      data: { title: 'Add Address', address: '', watcherUrl: '' },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addresses.push({ address: result.address } as Address);
      }
    });
  }

  deleteaddress(index: number): void {
    this.addresses.splice(index, 1);
  }

  pasteData(index: number): void {
    navigator.clipboard
      .readText()
      .then((pastedText) => {
        this.addresses[index].address = pastedText;
      })
      .catch((err) => {
        console.error('Failed to read clipboard contents: ', err);
      });
  }

  save(): void {
    this.storageService.putAddressData(this.addresses);
    this.router.navigate(['main'], {
      queryParams: { addresses: JSON.stringify(this.addresses) },
    });
  }

  cancel(): void {
    this.router.navigate(['main']);
  }

  ngOnInit(): void {
    this.dataService.getAddressesFromInputs().then((dataServiceAddresses) => {
      // combine addresses from address store,
      // but also from input data for backwards compatibility reasons

      return this.storageService.getAddressData().then((storageServiceAddresses) => {
        const addressMap = new Map<string, Address>();

        dataServiceAddresses.forEach((address: Address) => {
          addressMap.set(address.address, address);
        });

        storageServiceAddresses.forEach((address: Address) => {
          if (addressMap.has(address.address)) {
            const existingAddress = addressMap.get(address.address);
            addressMap.set(address.address, { ...existingAddress, ...address });
          } else {
            addressMap.set(address.address, address);
          }
        });

        this.addresses = Array.from(addressMap.values());
      });
    });
  }

  title = 'settings';
}
