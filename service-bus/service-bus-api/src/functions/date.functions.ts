import * as moment from 'moment';

export function sortDate<T = any>(list: T[], prop: string): T[] {
  return list.sort((a: T, b: T) => {
    let dateA = moment(a[prop]);
    let dateB = moment(b[prop]);
    if (dateA.isSame(dateB)) return 0;
    return dateA.isBefore(dateB) ? 1 : -1;
  })
}