import { __decorate, __param } from "tslib";
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QRCodeModule } from 'angularx-qrcode';
let QRDialogComponent = class QRDialogComponent {
    constructor(dialogRef, data) {
        this.dialogRef = dialogRef;
        this.data = data;
    }
    onCancelClick() {
        this.dialogRef.close();
    }
};
QRDialogComponent = __decorate([
    Component({
        selector: 'app-qr-dialog',
        templateUrl: './qrdialog.html',
        standalone: true,
        imports: [QRCodeModule],
    }),
    __param(1, Inject(MAT_DIALOG_DATA))
], QRDialogComponent);
export { QRDialogComponent };
//# sourceMappingURL=qrdialog.component.js.map