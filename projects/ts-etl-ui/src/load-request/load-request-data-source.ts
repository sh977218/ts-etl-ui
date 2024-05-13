import { LoadRequestsApiResponse } from '../model/load-request';
import { HttpClient } from '@angular/common/http';
import { SortDirection } from '@angular/material/sort';

export class LoadRequestDataSource {
  constructor(private _httpClient: HttpClient) {
  }

  getLoadRequests(filter: string = '',
                  sort: string = 'requestId',
                  order: SortDirection = 'asc',
                  pageNumber: number = 0,
                  pageSize:number = 10) {
    const params = {
      q: filter,
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
