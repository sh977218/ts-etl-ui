import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AsyncPipe, JsonPipe, KeyValuePipe, NgForOf, NgIf } from '@angular/common';
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

  loadVersion1$ = this.loadVersion$
    .pipe(
      map((loadVersion: LoadVersion) => {
        const filtered = Object.entries(loadVersion).filter(
          ([k]) => this.loadVersionKeys1.includes(k),
        );
        return Object.fromEntries(filtered);
      }),
    );

  loadVersion2$ = this.loadVersion$
    .pipe(
      map((loadVersion: LoadVersion) => {
        const filtered = Object.entries(loadVersion).filter(
          ([k]) => this.loadVersionKeys2.includes(k),
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
