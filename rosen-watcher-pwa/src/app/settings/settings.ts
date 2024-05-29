import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/data.service';
import { StorageService } from '../service/storage.service';
import { Router } from '@angular/router';
import { SettingsDialog } from './dialog'
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'settings',
  templateUrl: './settings.html'
})

export class Settings implements OnInit {
  addresses: string[];
  addressData: any[];
  


  constructor(private router: Router, private dataService: DataService, private storageService: StorageService, public dialog: MatDialog) {

    this.addresses = [

    ];

    this.addressData = [

    ];

  }

  trackByFn(index: any, item: any) {
    return index;
  }

  editaddress(index: number): void {
    const dialogRef = this.dialog.open(SettingsDialog, {
      data: { title: 'Edit Address', address: this.addresses[index], watcherUrl: this.addressData.find(a => a.address == this.addresses[index])?.watcherUrl }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addresses[index] = result.address;
        var editAddress = this.addressData.find(a => a.address == result.address);
        if (editAddress != null) {
          editAddress.watcherUrl = result.watcherUrl;
        }
        else {
          this.addressData.push({ watcherUrl: result.watcherUrl, address: result.address });
        }

      }
    });

  }

  addaddress(): void {
    const dialogRef = this.dialog.open(SettingsDialog, {
      data: { title: 'Add Address', address: '', watcherUrl: '' }
    });
    dialogRef.afterClosed().subscribe(result => {

      if (result) {
        this.addresses.push(result.address);
        this.addressData.push({ watcherUrl: result.watcherUrl, address: result.address });

      }
    });
  }

  getAddresses(): any[] {
 
    return this.addresses;
  }

  deleteaddress(index: number): void {
    this.addresses.splice(index, 1);
  }

  pasteData(index: number): void {
    navigator.clipboard.readText().then(pastedText => {

      this.addresses[index] = pastedText;
    }).catch(err => {
      console.error('Failed to read clipboard contents: ', err);
    });
  }

  save(): void {
    this.storageService.putAddressData(this.addressData);
    this.router.navigate(['main'], { queryParams: {addresses: JSON.stringify(this.addresses) }});
  }

  cancel(): void {
    this.router.navigate(['main']);
  }

  ngOnInit(): void {

    

    this.dataService.getAddresses().then(
      r => { this.addresses = r; }
    );

    this.storageService.getAddressData().then(
      r => { this.addressData = r; }
    );

  }

  title = 'settings';
}