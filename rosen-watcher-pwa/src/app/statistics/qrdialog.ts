import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'qrDialog',
  templateUrl: './qrdialog.html',
})
export class QRDialog {

  constructor(
    public dialogRef: MatDialogRef<QRDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancelClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {

  }
}
