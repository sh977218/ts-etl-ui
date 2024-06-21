import { LoadRequestsApiResponse } from '../model/load-request';
import { HttpClient } from '@angular/common/http';
import { SortDirection } from '@angular/material/sort';

export type LoadRequestFilter = {
  requestId: number | null;
  codeSystemName: string | null;
  requestSubject: string | null;
  type: string | null;
  requestStatus: string | null;
  requestTime: string | null;
  requestDateRange: string | null;
  requester: string | null
}

export class LoadRequestDataSource {
  constructor(private _httpClient: HttpClient) {
  }

  getLoadRequests(loadRequestFilter: LoadRequestFilter | unknown,
                  sort: string = 'requestId',
                  order: SortDirection = 'asc',
                  pageNumber: number = 0,
                  pageSize: number = 10) {
    let body = {};
    if (loadRequestFilter) {
      body = {
        sort,
        order,
        pageNumber,
        pageSize,
        ...loadRequestFilter,
      };
    }
    return this._httpClient.post<LoadRequestsApiResponse>('/loadRequests', body);
  }
}
