import { __decorate, __param } from "tslib";
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
let SettingsDialogComponent = class SettingsDialogComponent {
    constructor(dialogRef, data) {
        this.dialogRef = dialogRef;
        this.data = data;
    }
    onCancelClick() {
        this.dialogRef.close();
    }
    pasteData() {
        navigator.clipboard
            .readText()
            .then((pastedText) => {
            this.data.address = pastedText;
        })
            .catch((err) => {
            console.error('Failed to read clipboard contents: ', err);
        });
    }
};
SettingsDialogComponent = __decorate([
    Component({
        selector: 'app-dialog',
        templateUrl: './dialog.html',
        standalone: true,
        imports: [FormsModule, MatDialogClose],
    }),
    __param(1, Inject(MAT_DIALOG_DATA))
], SettingsDialogComponent);
export { SettingsDialogComponent };
//# sourceMappingURL=settings.dialog.js.map