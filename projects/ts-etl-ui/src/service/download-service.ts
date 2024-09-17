import { Injectable } from '@angular/core';

import { LoadRequest } from '../model/load-request';
import { LoadVersionActivity } from '../model/load-version';

type DownloadData = LoadRequest | LoadVersionActivity

@Injectable({ providedIn: 'root' })
export class DownloadService {

  generateBlob(header: string[], data: DownloadData[]) {
    return this.generateBlobCsv(header, data);
  }

  private generateBlobCsv(headerList: string[], data: DownloadData[]) {
    const array = JSON.parse(JSON.stringify(data));
    let str = '';
    let row = '';
    for (const index in headerList) {
      row += headerList[index] + ', ';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = '';
      headerList.forEach((head, index) => {
        if (index > 0) {
          line += ',';
        }
        let v = array[i][head];
        if (!v) {
          v = '';
        }
        if (typeof v === 'string') {
          v = v.replaceAll('"', '""');
        } else {
          v += '';
        }
        line += `"${v}"`;
      });
      str += line + '\r\n';
    }
    return new Blob([str], { type: 'text/csv' });
  }
}
