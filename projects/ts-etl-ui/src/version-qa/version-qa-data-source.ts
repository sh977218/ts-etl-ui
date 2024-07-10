import { HttpClient } from '@angular/common/http';
import { VersionQA, VersionQAsApiResponse } from '../model/version-qa';
import { SortDirection } from '@angular/material/sort';
import { environment } from '../environments/environment';

/*
 * because the versionQA is not server side pagination/sort/filter
 * but I leave sort/order/pageNumber/pageSize in here in case we decide to do a sever side pagination
 */
export type VersionQaSearchCriteria = {
  loadNumber: number | null;
  sort: string,
  order: SortDirection,
  pageNumber: number,
  pageSize: number
}

export class VersionQaDataSource {
  constructor(private http: HttpClient) {
  }

  getVersionQAs(versionQaSearchCriteria: VersionQaSearchCriteria) {
    return this.http.post<VersionQAsApiResponse>(`${environment.apiServer}/versionQAs`, versionQaSearchCriteria);
  }

  getVersionQA(requestId: string) {
    return this.http.get<VersionQA>(`versionQA/${requestId}`);
  }
}
