import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogClose,
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

interface DialogData {
  title: string;
  content: string;
  address: string;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.html',
  standalone: true,
  imports: [FormsModule, MatDialogClose],
})
export class SettingsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onCancelClick(): void {
    this.dialogRef.close();
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
