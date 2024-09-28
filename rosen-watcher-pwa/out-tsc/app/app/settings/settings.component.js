import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { SettingsDialogComponent } from './settings.dialog';
import { NgFor } from '@angular/common';
let SettingsComponent = class SettingsComponent {
    constructor(router, dataService, storageService, dialog) {
        this.router = router;
        this.dataService = dataService;
        this.storageService = storageService;
        this.dialog = dialog;
        this.title = 'settings';
        this.addresses = [];
    }
    trackByFn(index) {
        return index;
    }
    editaddress(index) {
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
                    });
                }
            }
        });
    }
    addaddress() {
        const dialogRef = this.dialog.open(SettingsDialogComponent, {
            data: { title: 'Add Address', address: '', watcherUrl: '' },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.addresses.push({ address: result.address });
            }
        });
    }
    deleteaddress(index) {
        this.addresses.splice(index, 1);
    }
    pasteData(index) {
        navigator.clipboard
            .readText()
            .then((pastedText) => {
            this.addresses[index].address = pastedText;
        })
            .catch((err) => {
            console.error('Failed to read clipboard contents: ', err);
        });
    }
    async save() {
        await this.storageService.putAddressData(this.addresses);
        this.router.navigate(['main'], {
            queryParams: { addresses: JSON.stringify(this.addresses) },
        });
    }
    cancel() {
        this.router.navigate(['main']);
    }
    async ngOnInit() {
        const inputs = await this.dataService.getInputs();
        this.dataService.getAddressesFromInputs(inputs).then((dataServiceAddresses) => {
            // combine addresses from address store,
            // but also from input data for backwards compatibility reasons
            return this.storageService.getAddressData().then((storageServiceAddresses) => {
                const addressMap = new Map();
                dataServiceAddresses.forEach((address) => {
                    addressMap.set(address.address, address);
                });
                storageServiceAddresses.forEach((address) => {
                    if (addressMap.has(address.address)) {
                        const existingAddress = addressMap.get(address.address);
                        addressMap.set(address.address, { ...existingAddress, ...address });
                    }
                    else {
                        addressMap.set(address.address, address);
                    }
                });
                this.addresses = Array.from(addressMap.values());
            });
        });
    }
};
SettingsComponent = __decorate([
    Component({
        selector: 'app-settings',
        templateUrl: './settings.html',
        standalone: true,
        imports: [NgFor],
    })
], SettingsComponent);
export { SettingsComponent };
//# sourceMappingURL=settings.component.js.map