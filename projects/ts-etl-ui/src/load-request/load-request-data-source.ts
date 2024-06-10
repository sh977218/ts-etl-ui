import { LoadRequestsApiResponse } from '../model/load-request';
import { HttpClient } from '@angular/common/http';
import { SortDirection } from '@angular/material/sort';

export type LoadRequestFilter = {
  requestId: number;
}

export class LoadRequestDataSource {
  constructor(private _httpClient: HttpClient) {
  }

  getLoadRequests(loadRequestFilter: LoadRequestFilter,
                  sort: string = 'requestId',
                  order: SortDirection = 'asc',
                  pageNumber: number = 0,
                  pageSize: number = 10) {
    const {requestId} = loadRequestFilter;
    const params = {
      requestId,
      sort,
      order,
      pageNumber,
      pageSize
    }
    return this._httpClient.get<LoadRequestsApiResponse>('/api/loadRequests', {
      params
    });
  }
}
