import { CommonModule, JsonPipe, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { assign } from 'lodash';
import { filter, map, switchMap } from 'rxjs';

import { triggerExpandTableAnimation } from '../animations';
import { environment } from '../environments/environment';
import { LoadSummaryComponent } from '../load-summary/load-summary.component';
import {
  LoadVersionAcceptanceActionsComponent,
} from '../load-version-acceptance-actions/load-version-acceptance-actions.component';
import { LoadVersionActivityComponent } from '../load-version-activity/load-version-activity.component';
import { LoadVersionAddNoteModalComponent } from '../load-version-add-note-modal/load-version-add-note-modal.component';
import { LoadVersionDetailComponent } from '../load-version-detail/load-version-detail.component';
import { LoadVersionNoteComponent } from '../load-version-note/load-version-note.component';
import { LoadVersionRulesComponent } from '../load-version-rules/load-version-rules.component';
import {
  generateLoadVersionPayload,
  LoadVersion,
  LoadVersionActivity,
  LoadVersionActivityNote,
  LoadVersionPayload,
  LoadVersionsApiResponse,
  LoadVersionSearchCriteria,
} from '../model/load-version';
import { AlertService } from '../service/alert-service';
import { ConstantService } from '../service/constant-service';
import { EasternTimePipe } from '../service/eastern-time.pipe';
import { UserService } from '../service/user-service';

@Component({
  standalone: true,
  imports: [
    NgIf,
    JsonPipe,
    RouterLink,
    CommonModule,
    EasternTimePipe,
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
    LoadVersionRulesComponent,
    LoadVersionRulesComponent,
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
    'loadStartTime',
    'requestId',
    'requester',
    'requestTime',
  ];
  searchRowColumns = this.displayedColumns.map(c => `${c}-search`);

  data: LoadVersion[] = [];

  resultsLength = 0;
  expandedElement: LoadVersion | null | undefined;
  username: string = '';

  @ViewChild(MatTable, { static: false }) table!: MatTable<LoadVersion>;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  searchCriteria = new FormGroup(
    {
      codeSystemName: new FormControl<string | undefined>(undefined, { updateOn: 'change' }),
      version: new FormControl<string | undefined>(undefined),
      loadNumber: new FormControl<number | undefined>(undefined),
      versionStatus: new FormControl<string | undefined>(undefined, { updateOn: 'change' }),
      loadStartTime: new FormControl<Date | undefined>(undefined),
      loadEndTime: new FormControl<Date | undefined>(undefined),
      requestId: new FormControl<number | undefined>(undefined),
      requester: new FormControl<Date | undefined>(undefined),
      requestStartTime: new FormControl<Date | undefined>(undefined),
      requestEndTime: new FormControl<Date | undefined>(undefined),
    }, { updateOn: 'submit' },
  );

  currentLoadVersionSearchCriteria: LoadVersionPayload = {
    pagination: {
      pageNum: 1,
      pageSize: 10,
    },
    searchColumns: {
      requestId: '',
      codeSystemName: '',
      requester: '',
      versionStatus: '',
      loadNumber: '',
      loadStartTime: '',
      loadEndTime: '',
      requestStartTime: '',
      requestEndTime: '',
    },
    sortCriteria: {
      sortDirection: 'asc',
      sortBy: 'loadNumber',
    },
  };

  constructor(private http: HttpClient,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private cd: ChangeDetectorRef,
              private userService: UserService,
              public constantService: ConstantService,
              private alertService: AlertService) {
    userService.user$.subscribe(user => {
      this.username = user!.username;
    });
    this.searchCriteria.valueChanges
      .subscribe(val => {
        this.router.navigate(['load-versions'], {
          queryParamsHandling: 'merge',
          queryParams: { expand: undefined, ...val },
        });
      });
  }

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    this.activatedRoute.queryParamMap
      .pipe(
        map((queryParams: Params) => {
          const qp = { ...queryParams['params'] };
          // update UI from query parameters
          const searchCriteriaFromQueryParameter = new LoadVersionSearchCriteria(qp);
          this.searchCriteria.patchValue(searchCriteriaFromQueryParameter, { emitEvent: false });
          return qp;
        }),
        map((qp): LoadVersionPayload => {
          const loadVersionPayload: LoadVersionPayload = generateLoadVersionPayload(qp);
          assign(this.currentLoadVersionSearchCriteria, loadVersionPayload);
          return this.currentLoadVersionSearchCriteria;
        }),
        switchMap((loadVersionPayload) => {
          return this.http.post<LoadVersionsApiResponse>(`${environment.apiServer}/loadVersions`, loadVersionPayload);
        }),
        map((data: LoadVersionsApiResponse) => {
          this.resultsLength = data.total_count;
          return data.items;
        }),
      )
      .subscribe({
        next: data => {
          this.data = data;
          const expand = this.activatedRoute.snapshot.queryParams['expand'];
          if (expand) {
            this.expandedElement = this.data.at(Number.parseInt(expand) || 0);
          }
        },
      });
  }

  expandRow(row: LoadVersion) {
    this.expandedElement = this.expandedElement === row ? null : row;
  }

  action(newLoadVersionActivity: LoadVersionActivity, loadVersion: LoadVersion) {
    this.http.post(`${environment.apiServer}/loadVersionActivity`, {
      requestId: loadVersion!.requestId,
      loadVersionActivity: newLoadVersionActivity,
    })
      .pipe(
        switchMap(() => this.http.get<LoadVersion>(`${environment.apiServer}/loadVersion/${loadVersion.requestId}`)),
      )
      .subscribe({
        next: (updatedLoadVersion) => {
          loadVersion.loadVersionActivities = updatedLoadVersion.loadVersionActivities;
          loadVersion.versionStatus = updatedLoadVersion.versionStatus;
          this.alertService.addAlert('', 'Activity added successfully.');
        },
      });
  }

  openAddNoteModal(loadVersion: LoadVersion) {
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
          activityNote.hashtags = activityNote.hashtags.filter(n => n !== '');
          return this.http.post<LoadVersion>(`${environment.apiServer}/addActivityNote`, {
            requestId: loadVersion.requestId,
            activityNote,
          }).pipe(map(() => activityNote));
        }),
      )
      .subscribe({
        next: (activityNote: LoadVersionActivityNote) => {
          loadVersion.loadVersionActivities[0].notes.push(activityNote);
          loadVersion.loadVersionActivities = [...loadVersion.loadVersionActivities];
          this.alertService.addAlert('', 'Note added successfully.');
        },
      });
  }

  handleSortEvent(e: Sort) {
    const { active, direction } = e;
    this.router.navigate(['load-versions'], {
      queryParamsHandling: 'merge',
      queryParams: {
        pageNum: 1,
        sortBy: active,
        sortDirection: direction,
      },
    });
  }
}
