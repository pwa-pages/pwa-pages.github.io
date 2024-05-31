import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FeatureService } from '../service/featureservice';


@Component({
  selector: 'qrDialog',
  templateUrl: './qrdialog.html'
})

export class QRDialog {

  useUrlSetting: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<QRDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any, private featureService: FeatureService
  ) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {

    this.useUrlSetting = this.featureService.useUrlSetting();

  }

}