import { AfterViewInit, Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { LoadVersionDataSource } from '../load-version/load-version-data-source';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { LoadVersion } from '../model/load-version';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../service/loading-service';

@Component({
  selector: 'app-version-qa-report',
  standalone: true,
  imports: [
    NgIf,
  ],
  templateUrl: './version-qa-report.component.html',
})
export class VersionQaReportComponent implements AfterViewInit {

  versionQaDatabase: LoadVersionDataSource | null = null;
  versionQA: LoadVersion | null = null;

  constructor(private http: HttpClient,
              private activatedRoute: ActivatedRoute,
              private loadingService: LoadingService,
  ) {
  }

  ngAfterViewInit(): void {
    this.versionQaDatabase = new LoadVersionDataSource(this.http);

    this.activatedRoute.paramMap
      .pipe(
        tap({ next: () => this.loadingService.showLoading() }),
        map((params: Params) => {
          return params['params']['requestId'];
        }),
        switchMap(requestId => {
          return this.versionQaDatabase!.getVersionQA(requestId).pipe(catchError(() => of(null)));
        }),
      )
      .subscribe({
        next: data => {
          this.loadingService.hideLoading();
          this.versionQA = data;
        },
        error: () => this.loadingService.hideLoading(),
      });
  }

}
