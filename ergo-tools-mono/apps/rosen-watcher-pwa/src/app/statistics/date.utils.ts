// src/app/helpers/math-helper.ts
import { Input } from '../../service/ts/models/input';

export class DateUtils {
  static formatDate(utcDate: Date): string {
    const day = utcDate.getUTCDate().toString().padStart(2, '0');
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[utcDate.getUTCMonth()];
    const year = utcDate.getUTCFullYear();

    return `${day} ${month} ${year}`;
  }

  static formatTime(utcDate: Date): string {
    const hours = utcDate.getUTCHours().toString().padStart(2, '0');
    const minutes = utcDate.getUTCMinutes().toString().padStart(2, '0');
    const seconds = utcDate.getUTCSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }

  static convertToUTCWithSameFields(date: Date | null): Date | null {
    if (!date) {
      return null;
    }
    return new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
      ),
    );
  }

  public static filterByPeriod(inputs: Input[], period: Period): Input[] {
    const date = new Date();

    switch (period) {
      case Period.Day:
        date.setDate(date.getDate() - 1);
        break;
      case Period.Week:
        date.setDate(date.getDate() - 7);
        break;
      case Period.Month:
        date.setMonth(date.getMonth() - 1);
        break;
      case Period.Year:
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setFullYear(date.getFullYear() - 100);
    }

    inputs = inputs.filter((r) => r.inputDate >= date);

    return inputs;
  }

  static StripTimeUTC() {
    return (date: Date | null): Date | null => {
      if (!date) return null;
      return new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
      );
    };
  }
}
