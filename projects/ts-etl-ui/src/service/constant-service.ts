import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, of, tap } from 'rxjs';

import { environment } from '../environments/environment';
import { PropertyResponse } from '../model/property';

const VERSION_STATUSES = [
  'Pending QA',
  'Accepted',
  'Rejected',
  'Failed',
];


@Injectable({ providedIn: 'root' })
export class ConstantService {

  propertyMapper = (res: PropertyResponse) => res.result.data.map(d => d.value);

  private CODE_SYSTEM_NAMES$ = this.http.get<PropertyResponse>(`${environment.newApiServer}/property/code-systems`)
    .pipe(map(this.propertyMapper), tap(res => this.CODE_SYSTEM_NAMES = res));

  private LOAD_REQUEST_STATUSES$ = this.http.get<PropertyResponse>(`${environment.newApiServer}/property/request-statuses`)
    .pipe(map(this.propertyMapper), tap(res => this.LOAD_REQUEST_STATUSES = res));

  private LOAD_REQUEST_TYPES$ = this.http.get<PropertyResponse>(`${environment.newApiServer}/property/request-types`)
    .pipe(map(this.propertyMapper), tap(res => this.LOAD_REQUEST_TYPES = res));

  private VERSION_STATUSES$ = of(VERSION_STATUSES)
    .pipe(tap(res => this.VERSION_STATUSES = res));

  constructor(private http: HttpClient) {
    forkJoin([
        this.CODE_SYSTEM_NAMES$,
        this.LOAD_REQUEST_STATUSES$,
        this.LOAD_REQUEST_TYPES$,
        this.VERSION_STATUSES$,
      ],
    ).subscribe();
  }

  CODE_SYSTEM_NAMES: string[] = [];
  LOAD_REQUEST_STATUSES: string[] = [];
  LOAD_REQUEST_TYPES: string[] = [];
  VERSION_STATUSES: string[] = [];


}

