import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QRCodeModule } from 'angularx-qrcode';

interface QRDialogData {
  title: string;
  content: string;
  qrData: string;
}

@Component({
  selector: 'app-qr-dialog',
  templateUrl: './qrdialog.html',
  standalone: true,
  imports: [QRCodeModule],
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
