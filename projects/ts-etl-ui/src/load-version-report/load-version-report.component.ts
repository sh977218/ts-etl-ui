import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AsyncPipe, JsonPipe, KeyValue, KeyValuePipe, NgForOf, NgIf } from '@angular/common';
import { LoadVersionDataSource } from '../load-version/load-version-data-source';
import { map, shareReplay, switchMap, tap } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../service/loading-service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoadVersion } from '../model/load-version';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { LoadRequestMessageComponent } from '../load-request-message/load-request-message.component';
import { LoadRequestDataSource } from '../load-request/load-request-data-source';
import { LoadSummaryComponent } from '../load-summary/load-summary.component';
import { CodeSystem, CodeSystemSourceInformation } from '../model/code-system';
import { environment } from '../environments/environment';

@Component({
  standalone: true,
  imports: [
    NgIf,
    MatExpansionModule,
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './load-version-report.component.html',
  styleUrls: ['./load-version-report.component.scss'],
})
export class LoadVersionReportComponent {
  loadVersionKeys1: string[] = ['codeSystemName', 'version', 'loadNumber'];
  loadVersionKeys2 = ['requestId', 'sourceFilePath'];
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

  identification1$ = this.loadVersion$
    .pipe(
      map((loadVersion: LoadVersion) => {
        const filtered = Object.entries(loadVersion).filter(
          ([k]) => this.loadVersionKeys1.includes(k),
        );
        return Object.fromEntries(filtered);
      }),
    );

  identification2$ = this.loadVersion$
    .pipe(
      map((loadVersion: LoadVersion) => {
        const filtered = Object.entries(loadVersion).filter(
          ([k]) => this.loadVersionKeys2.includes(k),
        );
        return Object.fromEntries(filtered);
      }),
    );

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
    'Rel Directionality Flag'];
  sourceInformationKeys2 = ['Content Contact', 'License Contact'];

  sourceInformationKeysCompareFn1 = (a: KeyValue<string, string>, b: KeyValue<string, string>) => {
    return this.sourceInformationKeys1.indexOf(a.key) - this.sourceInformationKeys1.indexOf(b.key);
  };

  sourceInformationKeysCompareFn2 = (a: KeyValue<string, string>, b: KeyValue<string, string>) => {
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
      map((codeSystemSourceInformation: CodeSystemSourceInformation) => {
        const filtered = Object.entries(codeSystemSourceInformation).filter(
          ([k]) => this.sourceInformationKeys1.includes(k),
        );
        return Object.fromEntries(filtered);
      }),
    );

  sourceInformation2$ = this.sourceInformation$
    .pipe(
      map((codeSystemSourceInformation: CodeSystemSourceInformation) => {
        const filtered = Object.entries(codeSystemSourceInformation).filter(
          ([k]) => this.sourceInformationKeys2.includes(k),
        );
        return Object.fromEntries(filtered);
      }),
    );

  constructor(private http: HttpClient,
              private activatedRoute: ActivatedRoute,
              private loadingService: LoadingService,
  ) {
  }

  setStep() {
    console.log('');
  }
}
