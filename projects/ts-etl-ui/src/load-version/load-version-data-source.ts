import { HttpClient } from '@angular/common/http';
import { LoadVersion, LoadVersionsApiResponse } from '../model/load-version';
import { SortDirection } from '@angular/material/sort';
import { environment } from '../environments/environment';

/*
 * because the load version is not server side pagination/sort/filter yet
 * but I leave sort/order/pageNumber/pageSize in here in case we decide to do a sever side pagination
 */
export type LoadVersionSearchCriteria = {
  loadNumber: number | null;
  sort: string,
  order: SortDirection,
  pageNumber: number,
  pageSize: number
}

export class LoadVersionDataSource {
  constructor(private http: HttpClient) {
  }

  getLoadVersions(loadVersionSearchCriteria: LoadVersionSearchCriteria) {
    return this.http.post<LoadVersionsApiResponse>(`${environment.apiServer}/loadVersions`, loadVersionSearchCriteria);
  }

  getLoadVersion(requestId: string) {
    return this.http.get<LoadVersion>(`${environment.apiServer}/loadVersion/${requestId}`);
  }
}
