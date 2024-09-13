import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns-tz';

@Pipe({
  name: 'easternTime',
  standalone: true,
})
export class EasternTimePipe implements PipeTransform {

  transform(value: Date | string | number, dateFormat: string = 'yyyy-MM-dd hh:mm a z', timeZone = 'America/New_York'): string {
    return value ? format(value, dateFormat, { timeZone }) : '';
  }
}
