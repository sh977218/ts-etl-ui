import { format } from 'date-fns-tz';

export const easternTimeFormatter = (value: Date | string | number, dateFormat: string = 'yyyy-MM-dd hh:mm a z', timeZone = 'America/New_York') => {
  return value ? format(value, dateFormat, { timeZone }) : '';
};
