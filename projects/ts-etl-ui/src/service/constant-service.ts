import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, of, tap } from 'rxjs';

import { environment } from '../environments/environment';
import { CreateRequestCodeSystemListProperty, Property, PropertyResponse } from '../model/property';

const VERSION_STATUSES = [
  'Pending QA',
  'Accepted',
  'Rejected',
  'Failed',
];


@Injectable({ providedIn: 'root' })
export class ConstantService {

  propertyMapper = (res: PropertyResponse) => res.result.data.map((d: Property) => d.value);
  createRequestCodeSystemListPropertyMapper = (res: PropertyResponse) => res.result.data.map((d: CreateRequestCodeSystemListProperty) => d.codeSystemName);

  private CODE_SYSTEM_NAMES$ = this.http.get<PropertyResponse>(`${environment.apiServer}/property/request-code-systems`)
    .pipe(map(this.propertyMapper), tap(res => this.CODE_SYSTEM_NAMES = res));

  private CREATE_REQUEST_CODE_SYSTEM_NAMES$ = this.http.get<PropertyResponse>(`${environment.apiServer}/property/code-system/list`)
    .pipe(map(this.createRequestCodeSystemListPropertyMapper), tap(res => this.CREATE_REQUEST_CODE_SYSTEM_NAMES = res));

  private LOAD_REQUEST_STATUSES$ = this.http.get<PropertyResponse>(`${environment.apiServer}/property/request-statuses`)
    .pipe(map(this.propertyMapper), tap(res => this.LOAD_REQUEST_STATUSES = res));

  private LOAD_REQUEST_TYPES$ = this.http.get<PropertyResponse>(`${environment.apiServer}/property/request-types`)
    .pipe(map(this.propertyMapper), tap(res => this.LOAD_REQUEST_TYPES = res));

  private VERSION_STATUSES$ = of(VERSION_STATUSES)
    .pipe(tap(res => this.VERSION_STATUSES = res));

  constructor(private http: HttpClient) {
    forkJoin([
        this.CODE_SYSTEM_NAMES$,
        this.CREATE_REQUEST_CODE_SYSTEM_NAMES$,
        this.LOAD_REQUEST_STATUSES$,
        this.LOAD_REQUEST_TYPES$,
        this.VERSION_STATUSES$,
      ],
    ).subscribe();
  }

  CODE_SYSTEM_NAMES: string[] = [];
  CREATE_REQUEST_CODE_SYSTEM_NAMES: string[] = [];
  LOAD_REQUEST_STATUSES: string[] = [];
  LOAD_REQUEST_TYPES: string[] = [];
  VERSION_STATUSES: string[] = [];
  CODE_SYSTEM_REQUIRED_SOURCE_FILE: Map<string, string[]> = new Map();
  
}

