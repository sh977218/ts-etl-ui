export const EU_TIMEZONE = 'Etc/Greenwich';
export const DEFAULT_TIMEZONE = 'America/New_York';
export const DEFAULT_TIME_FORMAT = 'yyyy-MM-dd hh:mm a z';

export const MAT_MONTH_MAP: Record<number, string> = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December',
};

export type MatDate = {
  year: number,
  month: number,
  day: number
}

export type User = {
  sub: string
  userId: number
  firstName: string
  lastName: string
  email: string
  role: string
}