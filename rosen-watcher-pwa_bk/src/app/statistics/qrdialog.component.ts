import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QRCodeComponent } from 'angularx-qrcode';

interface QRDialogData {
  title: string;
  content: string;
  qrData: string;
}

@Component({
  selector: 'app-qr-dialog',
  templateUrl: './qrdialog.html',
  standalone: true,
  imports: [QRCodeComponent],
})
export class QRDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<QRDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: QRDialogData,
  ) {}

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
