import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { LoadRequest, LoadRequestPayload, LoadRequestsResponse } from '../model/load-request';

export class LoadRequestDataSource {
  constructor(private http: HttpClient) {
  }

  getLoadRequests(loadRequestSearchCriteria: LoadRequestPayload) {
    return this.http.post<LoadRequestsResponse>(`${environment.apiServer}/loadRequests`, loadRequestSearchCriteria);
  }

  getLoadRequest(requestId: string) {
    return this.http.get<LoadRequest>(`${environment.apiServer}/loadRequest/${requestId}`);
  }
}
