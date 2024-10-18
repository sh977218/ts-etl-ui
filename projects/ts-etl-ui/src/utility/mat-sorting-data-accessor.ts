import { easternTimeFormatter } from './date-time-formatter';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const easternTimeMaSortingDataAccessor = (item: any, property: string) => {
  switch (property) {
    case 'startTime':
      return easternTimeFormatter(item.componentStartTime);
    case 'creationTime':
      return easternTimeFormatter(item.creationTime);
    case 'time':
      return easternTimeFormatter(item.creationTime);
    default:
      return item[property];
  }
};