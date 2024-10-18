import {
  AsyncPipe,
  KeyValue,
  KeyValuePipe,
  NgForOf,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map, Observable } from 'rxjs';

import { LoadRequestDetailResponse } from '../model/load-request-detail';
import { LoadVersion } from '../model/load-version';
import { EasternTimePipe } from '../service/eastern-time.pipe';

@Component({
  selector: 'app-load-version-report-identification',
  standalone: true,
  imports: [
    AsyncPipe,
    KeyValuePipe,
    NgForOf,
    NgIf,
    NgSwitchCase,
    RouterLink,
    NgSwitch,
    NgSwitchDefault,
    EasternTimePipe,
  ],
  templateUrl: './load-version-report-identification.component.html',
  styleUrl: './load-version-report-identification.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadVersionReportIdentificationComponent {
  identification$ = input.required<Observable<[LoadRequestDetailResponse, LoadVersion]>>();

  identificationKeys1: Record<string, string> = {
    'codeSystemName': 'Code System Name',
    'version': 'Version',
    'loadNumber': 'Load Number',
    'versionStatus': 'Load Status',
    'effectiveDate': 'TS Available Date',
    'loadStartTime': 'Load Start Time',
    'loadEndTime': 'Load End Time',
    'loadElapsedTime': 'Elapsed Time',
  };
  identificationKeys2: Record<string, string> = {
    'language': 'Language',
    'effectiveDate': 'EffectiveDate',
    'requestId': 'Request ID',
    'requestType': 'Request Type',
    'requestTime': 'Request Time',
    'requester': 'Requester',
    'sourceFilePath': 'Source File Path',
  };

  identification1$ = computed(() => this.identification$()
    .pipe(
      map(([loadRequest, loadVersion]) => {
        const filteredLoadRequest = Object.entries(loadRequest)
          .filter(item => Object.keys(this.identificationKeys1).includes(item[0]));
        filteredLoadRequest.forEach(item => {
          item[0] = this.identificationKeys1[item[0]];
        });
        const filteredLoadVersion = Object.entries(loadVersion)
          .filter(item => Object.keys(this.identificationKeys1).includes(item[0]));
        filteredLoadVersion.forEach(item => {
          item[0] = this.identificationKeys1[item[0]];
        });
        return Object.fromEntries([...filteredLoadRequest, ...filteredLoadVersion]);
      }),
    ));

  identification2$ = computed(() => this.identification$()
    .pipe(
      map(([loadRequest, loadVersion]) => {
        const filteredLoadRequest = Object.entries(loadRequest)
          .filter(item => Object.keys(this.identificationKeys2).includes(item[0]));
        filteredLoadRequest.forEach(item => {
          item[0] = this.identificationKeys2[item[0]];
        });
        const filteredLoadVersion = Object.entries(loadVersion)
          .filter(item => Object.keys(this.identificationKeys2).includes(item[0]));
        filteredLoadVersion.forEach(item => {
          item[0] = this.identificationKeys2[item[0]];
        });
        return Object.fromEntries([...filteredLoadRequest, ...filteredLoadVersion]);
      }),
    ));

  sourceInformationKeysCompareFn1 = (a: KeyValue<string, string>, b: KeyValue<string, string>) => {
    return Object.values(this.identificationKeys1).indexOf(a.key) - Object.values(this.identificationKeys1).indexOf(b.key);
  };

  sourceInformationKeysCompareFn2 = (a: KeyValue<string, string>, b: KeyValue<string, string>) => {
    return Object.values(this.identificationKeys2).indexOf(a.key) - Object.values(this.identificationKeys2).indexOf(b.key);
  };
}
