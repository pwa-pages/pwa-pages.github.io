// src/app/helpers/math-helper.ts
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

  static StripTimeUTC() {
    return (date: Date | null): Date | null => {
      if (!date) return null;
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    };
  }
}
