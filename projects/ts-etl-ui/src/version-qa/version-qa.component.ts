import {
  AfterViewInit, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, ViewChild,
} from '@angular/core';
import { CommonModule, JsonPipe, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { VersionQA, VersionQAActivity, VersionQAsApiResponse } from '../model/version-qa';
import { VersionQaDataSource, VersionQaSearchCriteria } from './version-qa-data-source';
import { LoadingService } from '../service/loading-service';
import { VersionQaDetailComponent } from '../version-qa-detail/version-qa-detail.component';
import { triggerExpandTableAnimation } from '../animations';
import { VersionQaActivityComponent } from '../version-qa-activity/version-qa-activity.component';
import { LoadSummaryComponent } from '../load-summary/load-summary.component';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import {
  VersionQaAcceptanceActionsComponent,
} from '../version-qa-acceptance-actions/version-qa-acceptance-actions.component';
import { AlertService } from '../service/alert-service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-version-qa',
  standalone: true,
  imports: [
    NgIf,
    JsonPipe,
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatOptionModule,
    MatSelectModule,
    VersionQaDetailComponent,
    VersionQaActivityComponent,
    LoadSummaryComponent,
    VersionQaAcceptanceActionsComponent,
  ],
  templateUrl: './version-qa.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  animations: [triggerExpandTableAnimation],
})
export class VersionQaComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'codeSystemName',
    'version',
    'loadNumber',
    'versionStatus',
    'loadTime',
    'requestId',
    'requester',
    'requestTime',
  ];

  versionQaDatabase: VersionQaDataSource | null = null;
  data: VersionQA[] = [];

  resultsLength = 0;
  expandedElement: VersionQA | null = null;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(private http: HttpClient,
              private activatedRoute: ActivatedRoute,
              private dialog: MatDialog,
              private cd: ChangeDetectorRef,
              private loadingService: LoadingService,
              private alertService: AlertService) {
  }

  ngAfterViewInit() {
    this.versionQaDatabase = new VersionQaDataSource(this.http);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    this.activatedRoute.queryParamMap
      .pipe(
        tap({ next: () => this.loadingService.showLoading() }),
        map((queryParams: Params) => {
          const qp = { ...queryParams['params'] };
          if (qp.loadNumber) {
            qp.loadNumber = parseInt(qp.loadNumber);
          }
          return qp;
        }),
        map((qp): VersionQaSearchCriteria => {
          const DEFAULT_SEARCH_CRITERIA: VersionQaSearchCriteria = {
            loadNumber: null,
            sort: 'requestId',
            order: 'asc',
            pageNumber: 0,
            pageSize: 10,
          };
          const versionQaSearchCriteria = Object.assign(DEFAULT_SEARCH_CRITERIA, qp);
          return versionQaSearchCriteria;
        }),
        switchMap((versionQaSearchCriteria) => {
          return this.versionQaDatabase!.getVersionQAs(versionQaSearchCriteria)
            .pipe(catchError(() => of(null)));
        }),
        map((data: VersionQAsApiResponse | null) => {
          if (data === null) {
            return [];
          }
          this.resultsLength = data.total_count;
          return data.items;
        }),
      )
      .subscribe({
        next: data => {
          this.loadingService.hideLoading();
          this.data = data;
          if (this.activatedRoute.snapshot.queryParams['expand'] === 'true') {
            this.expandedElement = this.data[0];
          }
        },
        error: () => this.loadingService.hideLoading(),
      });
  }

  action(newQAActivity: VersionQAActivity, versionQA: VersionQA) {
    this.http.post(`${environment.apiServer}/qaActivity`, {
      requestId: versionQA!.requestId,
      qaActivity: newQAActivity,
    })
      .pipe(
        switchMap(() => this.http.get<VersionQA>(`versionQA/${versionQA.requestId}`)),
      )
      .subscribe({
        next: (updatedVersionQa) => {
          versionQA.versionQaActivities = updatedVersionQa.versionQaActivities;
          versionQA.versionStatus = updatedVersionQa.versionStatus;
          this.cd.detectChanges();
          this.alertService.addAlert('', 'Activity added successfully.');
        }, error: () => this.alertService.addAlert('', 'Activity add failed.'),
      });
  }

}
