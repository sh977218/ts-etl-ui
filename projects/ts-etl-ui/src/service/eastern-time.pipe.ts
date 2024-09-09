import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment-timezone';

@Pipe({
  name: 'easternTime',
  standalone: true,
})
export class EasternTimePipe implements PipeTransform {

  transform(value: Date | string, dateFormat: string = 'YYYY-MM-DD z'): string {
    return moment(value).tz('America/New_York').format(dateFormat);
  }
}
