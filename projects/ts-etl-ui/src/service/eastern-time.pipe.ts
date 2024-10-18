import { Pipe, PipeTransform } from '@angular/core';

import { easternTimeFormatter } from '../utility/date-time-formatter';

@Pipe({
  name: 'easternTime',
  standalone: true,
})
export class EasternTimePipe implements PipeTransform {

  transform(value: Date | string | number, dateFormat: string = 'yyyy-MM-dd hh:mm a z', timeZone = 'America/New_York'): string {
    return easternTimeFormatter(value, dateFormat, timeZone);
  }
}
