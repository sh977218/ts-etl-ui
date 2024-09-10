import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns-tz';

@Pipe({
  name: 'easternTime',
  standalone: true,
})
export class EasternTimePipe implements PipeTransform {

  transform(value: Date | string, dateFormat: string = 'yyyy-MM-dd hh:mma z', timeZone = 'America/New_York'): string {
    return format(value, dateFormat, { timeZone });
  }
}
