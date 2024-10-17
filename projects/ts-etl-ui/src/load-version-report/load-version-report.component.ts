import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { AsyncPipe, JsonPipe, KeyValue, KeyValuePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Params } from '@angular/router';
import {
  catchError,
  combineLatestWith,
  distinctUntilChanged,
  map,
  Observable,
  shareReplay,
  switchMap,
} from 'rxjs';

import { environment } from '../environments/environment';
import { LoadComponentMessageComponent } from '../load-component-message/load-component-message.component';
import { LoadSummaryComponent } from '../load-summary/load-summary.component';
import {
  LoadVersionReportIdentificationComponent,
} from '../load-version-identification/load-version-report-identification.component';
import {
  LoadVersionReportComparisonComponent,
} from '../load-version-report-comparison/load-version-report-comparison.component';
import { LoadVersionReportRuleComponent } from '../load-version-report-rule/load-version-report-rule.component';
import {
  LoadVersionReportRuleMessageComponent,
} from '../load-version-report-rule-message/load-version-report-rule-message.component';
import {
  LoadVersionReportSummaryComponent,
} from '../load-version-summary/load-version-report-summary.component';
import {
  CodeSystem,
  CodeSystemSourceInformation1,
  CodeSystemSourceInformation2,
} from '../model/code-system';
import { LoadComponentMessage, LoadRequestDetailResponse } from '../model/load-request-detail';
import {
  LoadVersion,
  RuleMessageUI,
  RuleUI,
  Summary,
  Validation,
  Verification,
} from '../model/load-version';

@Component({
  standalone: true,
  imports: [
    NgIf,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    NgForOf,
    KeyValuePipe,
    AsyncPipe,
    CdkCopyToClipboard,
    JsonPipe,
    LoadComponentMessageComponent,
    LoadSummaryComponent,
    LoadSummaryComponent,
    MatTableModule,
    MatCheckbox,
    NgClass,
    LoadVersionReportRuleMessageComponent,
    LoadVersionReportRuleComponent,
    LoadVersionReportIdentificationComponent,
    LoadVersionReportSummaryComponent,
    LoadVersionReportComparisonComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  templateUrl: './load-version-report.component.html',
  styleUrls: ['./load-version-report.component.scss'],
})
export class LoadVersionReportComponent {

  loadRequest$ = this.activatedRoute.paramMap
    .pipe(
      map((params: Params) => {
        return params['params']['requestId'];
      }),
      switchMap(requestId => {
        return this.http.get<LoadRequestDetailResponse>(`${environment.apiServer}/load-request/${requestId}`);
      }),
      shareReplay(1),
    );

  loadVersion$ = this.activatedRoute.paramMap
    .pipe(
      map((params: Params) => {
        return params['params']['requestId'];
      }),
      distinctUntilChanged(),
      switchMap(requestId => {
        return this.http.get<LoadVersion>(`${environment.apiServer}/loadVersion/${requestId}`);
      }),
      shareReplay(1),
    );


  loadComponentMessages$ = this.loadVersion$.pipe(map(loadVersion => {
    return loadVersion.loadSummary.components.reduce((previousValue: LoadComponentMessage[], currentValue) => {
      const loadComponentMessage: LoadComponentMessage[] = [
        ...currentValue.errors.map(error => {
          return {
            ...error,
            componentName: currentValue.componentName,
            messageTag: '',
            creationTime: '',
            messageGroup: 'Error',
          };
        }),
        ...currentValue.infos.map(info => {
          return {
            ...info,
            componentName: currentValue.componentName,
            messageTag: '',
            creationTime: '',
            messageGroup: 'Info',
          };
        }),
        ...currentValue.warnings.map(warning => {
          return {
            ...warning,
            componentName: currentValue.componentName,
            messageTag: '',
            creationTime: '',
            messageGroup: 'Warning',
          };
        }),
      ];
      return [
        ...previousValue,
        ...loadComponentMessage,
      ];
    }, []) || [];
  }));

  identification$: Observable<[LoadRequestDetailResponse, LoadVersion]> = this.loadRequest$.pipe(combineLatestWith(this.loadVersion$));

  sourceInformationKeys1: string[] = [
    'Version ID',
    'Source Family',
    'Source Name',
    'Normalized Source',
    'Official Name',
    'Stripped Source',
    'Version',
    'Low Source',
    'Restriction Level',
    'NLM Contact',
    'Acquisition Contact',
    'URL',
    'Language',
    'Citation',
    'License Info',
    'Character Set',
    'Context Type',
    'Rel Directionality Flag',
  ];
  sourceInformationKeys2 = ['Content Contact', 'License Contact'];

  sourceInformationKeysCompareFn1 = (a: KeyValue<string, string>, b: KeyValue<string, string>) => {
    return this.sourceInformationKeys1.indexOf(a.key) - this.sourceInformationKeys1.indexOf(b.key);
  };

  sourceInformationKeysCompareFn2 = (a: KeyValue<string, string[]>, b: KeyValue<string, string[]>) => {
    return this.sourceInformationKeys2.indexOf(a.key) - this.sourceInformationKeys1.indexOf(b.key);
  };

  private sourceInformation$ = this.loadRequest$.pipe(
    switchMap(loadRequest => {
      const codeSystemName = loadRequest.result.data.loadRequestSummary.codeSystemName;
      return this.http.get<CodeSystem>(`${environment.apiServer}/codeSystem/${codeSystemName}`);
    }),
    map((codeSystem: CodeSystem) => {
      return codeSystem.sourceInformation;
    }),
    shareReplay(1),
  );
  sourceInformation1$ = this.sourceInformation$
    .pipe(
      map((codeSystemSourceInformation: CodeSystemSourceInformation1) => {
        const filtered = Object.entries(codeSystemSourceInformation).filter(
          ([k]) => this.sourceInformationKeys1.includes(k),
        );
        return Object.fromEntries(filtered);
      }),
    );

  sourceInformation2$ = this.sourceInformation$
    .pipe(
      map((codeSystemSourceInformation: CodeSystemSourceInformation2) => {
        const filtered = Object.entries(codeSystemSourceInformation).filter(
          ([k]) => this.sourceInformationKeys2.includes(k),
        );
        return Object.fromEntries(filtered);
      }),
    );

  verificationSummaryColumn = [
    'totalRules', 'rulesWithData', 'error', 'messageGroupCountWarning', 'info', 'action',
  ];

  verificationSummary$ = this.loadVersion$.pipe(
    map((loadVersion) => {
      return this.ruleToSummary(loadVersion.verification);
    }),
  );

  verificationQARules$ = this.loadVersion$.pipe(
    map((loadVersion: LoadVersion) => {
      return loadVersion.verification.rules.map(rule => {
        return {
          name: rule.name,
          description: rule.description,
          dataAvailable: rule.dataAvailable,
          messagesGroupCount: {
            numOfError: rule.messages.filter(message => message.messageGroup === 'Error')?.length || 0,
            numOfWarning: rule.messages.filter(message => message.messageGroup === 'Warning')?.length || 0,
            numOfInfo: rule.messages.filter(message => message.messageGroup === 'Info')?.length || 0,
          },
          messages: rule.messages,
        } as RuleUI;
      });
    }),
  );

  verificationRuleMessages$ = this.loadVersion$.pipe(
    map((loadVersion: LoadVersion) => {
      return loadVersion.verification.rules.reduce((previousValue: RuleMessageUI[], currentValue) => {
        const curr = currentValue.messages.map(message => {
          return {
            name: currentValue.name,
            ...message,
          } as RuleMessageUI;
        });
        return [...curr, ...previousValue];
      }, []);
    }),
    catchError(() => []),
  );

  validationSummary$ = this.loadVersion$.pipe(
    map((loadVersion) => {
      return this.ruleToSummary(loadVersion.validation);
    }),
  );

  private ruleToSummary = (v: Verification | Validation) => {
    const rules = v.rules;
    return [{
      totalRules: rules.length,
      rulesWithData: rules.filter(rule => rule.dataAvailable === 'Yes')?.length || 0,
      messagesGroupCount: {
        numOfError: rules.reduce((previousValue: number, currentValue) => {
          return previousValue + currentValue.messages.filter(message => message.messageGroup === 'Error')?.length || 0;
        }, 0),
        numOfWarning: rules.reduce((previousValue: number, currentValue) => {
          return previousValue + currentValue.messages.filter(message => message.messageGroup === 'Warning')?.length || 0;
        }, 0),
        numOfInfo: rules.reduce((previousValue: number, currentValue) => {
          return previousValue + currentValue.messages.filter(message => message.messageGroup === 'Info')?.length || 0;
        }, 0),
      },
    }] as Summary[];
  };

  constructor(private http: HttpClient,
              private activatedRoute: ActivatedRoute,
  ) {
  }
}
