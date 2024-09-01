import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'qrDialog',
  templateUrl: './qrdialog.html',
  standalone: true,
  imports: [QRCodeModule],
})
export class QRDialog implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<QRDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onCancelClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {}
}
