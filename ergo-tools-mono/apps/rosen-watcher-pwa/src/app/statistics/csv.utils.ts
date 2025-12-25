// src/app/helpers/math-helper.ts
import { Input } from '@ergo-tools/service';

export class CsvUtils {
  public static csvExportInputs(inputs: Input[]) {
    const content = inputs
      .map((i) => `"${i.chainType}","${i.inputDate}","${i.amount}"`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();

    URL.revokeObjectURL(url);
  }
}
