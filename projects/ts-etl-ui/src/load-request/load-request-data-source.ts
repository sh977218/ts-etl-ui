import { LoadRequestsApiResponse } from '../model/load-request';
import { HttpClient } from '@angular/common/http';
import { SortDirection } from '@angular/material/sort';

export class LoadRequestDataSource {
  constructor(private _httpClient: HttpClient) {
  }

  getLoadRequests(filter: string = '',
                  filters = [],
                  sort: string = 'requestId',
                  order: SortDirection = 'asc',
                  pageNumber: number = 0,
                  pageSize: number = 10) {
    const body = {
      q: filter,
      filters,
      sort,
      order,
      pageNumber,
      pageSize
    }
    return this._httpClient.post<LoadRequestsApiResponse>('/api/loadRequests', body);
  }
}
