import {HttpClient} from '@angular/common/http';
import {VersionQAsApiResponse} from '../model/version-qa';
import {SortDirection} from "@angular/material/sort";

export class VersionQaDataSource {
  constructor(private _httpClient: HttpClient) {
  }

  getVersionQAs(sort: string, order: SortDirection, page: number) {
    const params = {
      sort,
      order,
      page
    }
    return this._httpClient.get<VersionQAsApiResponse>('/api/versionQAs', {params});
  }
}
