import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AsyncPipe, KeyValue, KeyValuePipe, NgForOf, NgIf } from '@angular/common';
import { LoadVersion } from '../model/load-version';
import { map, Observable } from 'rxjs';
import { LoadRequest } from '../model/load-request';

@Component({
  selector: 'app-load-version-report-identification',
  standalone: true,
  imports: [
    AsyncPipe,
    KeyValuePipe,
    NgForOf,
    NgIf,
  ],
  templateUrl: './load-version-report-identification.component.html',
  styleUrl: './load-version-report-identification.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadVersionReportIdentificationComponent {
  identification$ = input.required<Observable<[LoadRequest, LoadVersion]>>();

  identificationKeys1: Record<string, string> = {
    'codeSystemName': 'Code System Name',
    'version': 'Version',
    'loadNumber': 'Load Number',
    'versionStatus': 'Load Status',
    'effectiveDate': 'TS Available Date',
  };
  identificationKeys2: Record<string, string> = {
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
