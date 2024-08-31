import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dialog',
  templateUrl: './dialog.html',
})
export class SettingsDialog {

  constructor(
    public dialogRef: MatDialogRef<SettingsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onCancelClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {

  }

  pasteData(): void {
    navigator.clipboard
      .readText()
      .then((pastedText) => {
        this.data.address = pastedText;
      })
      .catch((err) => {
        console.error('Failed to read clipboard contents: ', err);
      });
  }
}
