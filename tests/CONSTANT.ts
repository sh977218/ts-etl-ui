import { join } from 'path';

export const PROJECT_ROOT_FOLDER = join(__dirname, '..');
export const NYC_OUTPUT_FOLDER = join(PROJECT_ROOT_FOLDER, 'e2e_nyc_output');
export const COVERAGE_REPORT_FOLDER = join(PROJECT_ROOT_FOLDER, 'coverage-e2e');

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
  username: string
  userId: number
  firstName: string
  lastName: string
  email: string
  role: string
}