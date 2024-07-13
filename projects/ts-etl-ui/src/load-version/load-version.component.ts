import {
  AfterViewInit, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, ViewChild,
} from '@angular/core';
import { CommonModule, JsonPipe, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';
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

import {
  LoadVersion, LoadVersionActivityNote,
  LoadVersionsApiResponse,
} from '../model/load-version';
import { LoadVersionDataSource, LoadVersionSearchCriteria } from './load-version-data-source';
import { LoadingService } from '../service/loading-service';
import { triggerExpandTableAnimation } from '../animations';
import { LoadVersionDetailComponent } from '../load-version-detail/load-version-detail.component';
import { LoadVersionActivityComponent } from '../load-version-activity/load-version-activity.component';
import { LoadSummaryComponent } from '../load-summary/load-summary.component';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import {
  LoadVersionAcceptanceActionsComponent,
} from '../load-version-acceptance-actions/load-version-acceptance-actions.component';
import { AlertService } from '../service/alert-service';
import { CODE_SYSTEM_NAMES } from '../service/constant';
import { LoadVersionNoteComponent } from '../load-version-note/load-version-note.component';
import { LoadVersionAddNoteModalComponent } from '../load-version-add-note-modal/load-version-add-note-modal.component';
import { UserService } from '../service/user-service';

@Component({
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
    LoadVersionDetailComponent,
    LoadVersionActivityComponent,
    LoadSummaryComponent,
    LoadVersionAcceptanceActionsComponent,
    LoadVersionNoteComponent,
  ],
  templateUrl: './load-version.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  animations: [triggerExpandTableAnimation],
})
export class LoadVersionComponent implements AfterViewInit {
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
  searchRowColumns = this.displayedColumns.map(c => `${c}-search`);

  loadVersionDatabase: LoadVersionDataSource | undefined;
  data: LoadVersion[] = [];

  resultsLength = 0;
  expandedElement: LoadVersion | null;
  username: string = '';

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;


  searchCriteria = new FormGroup(
    {
      codeSystemName: new FormControl<string | undefined>('', { updateOn: 'change' }),
      version: new FormControl<string | undefined>('', { updateOn: 'change' }),
      loadNumber: new FormControl<number | undefined>(undefined),
      versionStatus: new FormControl<string | undefined>('', { updateOn: 'change' }),
      loadTimeStartTime: new FormControl<Date | undefined>(undefined),
      loadTimeEndTime: new FormControl<Date | undefined>(undefined),
      requestId: new FormControl<number | undefined>(undefined),
      requester: new FormControl<Date | undefined>(undefined),
      requestStartTime: new FormControl<Date | undefined>(undefined),
      requestEndTime: new FormControl<Date | undefined>(undefined),
    }, { updateOn: 'submit' },
  );

  constructor(private http: HttpClient,
              private activatedRoute: ActivatedRoute,
              private dialog: MatDialog,
              private cd: ChangeDetectorRef,
              private loadingService: LoadingService,
              private userService: UserService,
              private alertService: AlertService) {
    userService.user$.subscribe(user => {
      this.username = user?.utsUser.username || '';
    });
  }

  ngAfterViewInit() {
    this.loadVersionDatabase = new LoadVersionDataSource(this.http);

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
        map((qp): LoadVersionSearchCriteria => {
          const DEFAULT_SEARCH_CRITERIA: LoadVersionSearchCriteria = {
            loadNumber: null,
            sort: 'requestId',
            order: 'asc',
            pageNumber: 0,
            pageSize: 10,
          };
          const loadVersionSearchCriteria = Object.assign(DEFAULT_SEARCH_CRITERIA, qp);
          return loadVersionSearchCriteria;
        }),
        switchMap((loadVersionSearchCriteria) => {
          return this.loadVersionDatabase!.getLoadVersions(loadVersionSearchCriteria)
            .pipe(catchError(() => of(null)));
        }),
        map((data: LoadVersionsApiResponse | null) => {
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
        },
        error: () => this.loadingService.hideLoading(),
      });
  }

  openAddNote(row: LoadVersion) {
    this.dialog
      .open(LoadVersionAddNoteModalComponent, {
        width: '600px',
      })
      .afterClosed()
      .pipe(
        filter(reason => !!reason),
        switchMap((activityNote: LoadVersionActivityNote) => {
          activityNote.createdBy = this.username;
          activityNote.createdTime = new Date();
          return this.http.post<LoadVersion>('/api/addActivityNote', {
            requestId: row.requestId,
            activityNote,
          });
        }),
      )
      .subscribe({
        next: () => {
          this.alertService.addAlert('', 'Activity added successfully.');
        }, error: () => this.alertService.addAlert('', 'Activity add failed.'),
      });
  }


  protected readonly CODE_SYSTEM_NAMES = CODE_SYSTEM_NAMES;
}
