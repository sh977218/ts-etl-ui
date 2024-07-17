import { HttpClient } from '@angular/common/http';
import { SortDirection } from '@angular/material/sort';
import { environment } from '../environments/environment';
import { LoadRequest, LoadRequestsResponse } from '../model/load-request';

export type LoadRequestSearchCriteria = {
  sort: string,
  order: SortDirection,
  pageNumber: number,
  pageSize: number
}

export class LoadRequestDataSource {
  constructor(private http: HttpClient) {
  }

  getLoadRequests(loadRequestSearchCriteria: LoadRequestSearchCriteria) {
    return this.http.post<LoadRequestsResponse>(`${environment.apiServer}/loadRequests`, loadRequestSearchCriteria);
  }

  getLoadRequest(requestId: string) {
    return this.http.get<LoadRequest>(`${environment.apiServer}/loadRequest/${requestId}`);
  }
}
