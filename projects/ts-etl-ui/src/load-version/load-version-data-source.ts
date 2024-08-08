import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';
import { LoadVersion, LoadVersionPayload, LoadVersionsApiResponse } from '../model/load-version';

export class LoadVersionDataSource {
  constructor(private http: HttpClient) {
  }

  getLoadVersions(loadVersionPayload: LoadVersionPayload) {
    return this.http.post<LoadVersionsApiResponse>(`${environment.apiServer}/loadVersions`, loadVersionPayload);
  }

  getLoadVersion(requestId: string) {
    return this.http.get<LoadVersion>(`${environment.apiServer}/loadVersion/${requestId}`);
  }
}
