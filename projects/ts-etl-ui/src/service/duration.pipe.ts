import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationFormat',
  standalone: true
})
export class DurationPipe implements PipeTransform {

  transform(value: number): string {
    if (value < 0) {
      return '00:00:00';
    }

    const seconds = Math.floor((value / 1000) % 60);
    const minutes = Math.floor((value / (1000 * 60)) % 60);
    const hours = Math.floor((value / (1000 * 60 * 60)) % 24);

    const hoursString = hours < 10 ? '0' + hours : hours;
    const minutesString = minutes < 10 ? '0' + minutes : minutes;
    const secondsString = seconds < 10 ? '0' + seconds : seconds;

    return `${hoursString}:${minutesString}:${secondsString}`;
  }

}
