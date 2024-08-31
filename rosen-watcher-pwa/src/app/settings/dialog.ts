import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dialog',
  templateUrl: './dialog.html',
  standalone: true,
  imports: [FormsModule, MatDialogClose],
})
export class SettingsDialog {
  constructor(
    public dialogRef: MatDialogRef<SettingsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onCancelClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {}

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
