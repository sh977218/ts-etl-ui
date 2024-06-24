import { LoadRequestsApiResponse } from '../model/load-request';
import { HttpClient } from '@angular/common/http';
import { SortDirection } from '@angular/material/sort';

export type LoadRequestSearchCriteria = {
  requestId: number | null;
  codeSystemName: string | null;
  requestSubject: string | null;
  type: string | null;
  requestStatus: string | null;
  requestTime: string | null;
  requestDateRange: string | null;
  requester: string | null,
  sort: string,
  order: SortDirection,
  pageNumber: number,
  pageSize: number
}

export class LoadRequestDataSource {
  constructor(private http: HttpClient) {
  }

  getLoadRequests(loadRequestSearchCriteria: LoadRequestSearchCriteria) {
    return this.http.post<LoadRequestsApiResponse>('/api/loadRequests', loadRequestSearchCriteria);
  }
}
