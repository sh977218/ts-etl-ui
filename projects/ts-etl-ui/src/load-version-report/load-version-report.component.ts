import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { AsyncPipe, JsonPipe, KeyValue, KeyValuePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { LoadSummaryComponent } from '../load-summary/load-summary.component';
import {
  CodeSystem,
  CodeSystemSourceInformation1,
  CodeSystemSourceInformation2,
} from '../model/code-system';
import { environment } from '../environments/environment';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Params } from '@angular/router';
import { catchError, combineLatestWith, map, Observable, shareReplay, switchMap, tap } from 'rxjs';

import { LoadRequestDataSource } from '../load-request/load-request-data-source';
import { LoadRequestMessageComponent } from '../load-request-message/load-request-message.component';
import { LoadVersionDataSource } from '../load-version/load-version-data-source';
import {
  LoadVersionReportIdentificationComponent,
} from '../load-version-identification/load-version-report-identification.component';
import { LoadVersionReportRuleComponent } from '../load-version-report-rule/load-version-report-rule.component';
import {
  LoadVersionReportRuleMessageComponent,
} from '../load-version-report-rule-message/load-version-report-rule-message.component';
import { LoadRequest } from '../model/load-request';
import { LoadVersion, RuleMessageUI, RuleUI } from '../model/load-version';
import { LoadingService } from '../service/loading-service';

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
    LoadRequestMessageComponent,
    LoadSummaryComponent,
    LoadSummaryComponent,
    MatTableModule,
    MatCheckbox,
    NgClass,
    LoadVersionReportRuleMessageComponent,
    LoadVersionReportRuleComponent,
    LoadVersionReportIdentificationComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './load-version-report.component.html',
  styleUrls: ['./load-version-report.component.scss'],
})
export class LoadVersionReportComponent {

  loadVersionDatabase: LoadVersionDataSource = new LoadVersionDataSource(this.http);
  loadRequestDatabase: LoadRequestDataSource = new LoadRequestDataSource(this.http);
  loadVersion$ = this.activatedRoute.paramMap
    .pipe(
      tap({ next: () => this.loadingService.showLoading() }),
      map((params: Params) => {
        return params['params']['requestId'];
      }),
      switchMap(requestId => {
        return this.loadVersionDatabase.getLoadVersion(requestId)
          .pipe(
            tap({
              next: () => this.loadingService.hideLoading(),
              error: () => this.loadingService.hideLoading(),
            }),
          );
      }),
      shareReplay(1),
    );
  loadRequest$ = this.activatedRoute.paramMap
    .pipe(
      tap({ next: () => this.loadingService.showLoading() }),
      map((params: Params) => {
        return params['params']['requestId'];
      }),
      switchMap(requestId => {
        return this.loadRequestDatabase.getLoadRequest(requestId)
          .pipe(
            tap({
              next: () => this.loadingService.hideLoading(),
              error: () => this.loadingService.hideLoading(),
            }),
          );
      }),
    );

  identification$: Observable<[LoadRequest, LoadVersion]> = this.loadRequest$.pipe(combineLatestWith(this.loadVersion$));

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
      return this.http.get<CodeSystem>(`${environment.apiServer}/codeSystem/${loadRequest.codeSystemName}`);
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
    map((loadVersion: LoadVersion) => {
      return [{
        totalRules: loadVersion.verification.rules.length,
        rulesWithData: loadVersion.verification.rules.filter(rule => rule.dataAvailable === 'Yes')?.length || 0,
        error: loadVersion.verification.rules.reduce((previousValue: number, currentValue) => {
          return previousValue + currentValue.messages.filter(message => message.messageGroup === 'Error')?.length || 0;
        }, 0),
        messageGroupCountWarning: loadVersion.verification.rules.reduce((previousValue: number, currentValue) => {
          return previousValue + currentValue.messages.filter(message => message.messageGroup === 'Warning')?.length || 0;
        }, 0),
        info: loadVersion.verification.rules.reduce((previousValue: number, currentValue) => {
          return previousValue + currentValue.messages.filter(message => message.messageGroup === 'Info')?.length || 0;
        }, 0),
      }];
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

  constructor(private http: HttpClient,
              private activatedRoute: ActivatedRoute,
              private loadingService: LoadingService,
  ) {
  }
}
