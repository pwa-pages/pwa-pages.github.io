import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FeatureService } from '../service/featureservice';

@Component({
  selector: 'dialog',
  templateUrl: './dialog.html',
})
export class SettingsDialog {
  useUrlSetting: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<SettingsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private featureService: FeatureService,
  ) {}

  onCancelClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.useUrlSetting = this.featureService.useUrlSetting();
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
