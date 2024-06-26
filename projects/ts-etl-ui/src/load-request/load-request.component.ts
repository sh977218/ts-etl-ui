import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA, signal,
  ViewChild, WritableSignal,
} from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { saveAs } from 'file-saver';

import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { catchError, filter, map, of, startWith, Subject, switchMap, tap } from 'rxjs';

import { LoadRequestDataSource, LoadRequestSearchCriteria } from './load-request-data-source';
import { LoadRequest, LoadRequestsApiResponse } from '../model/load-request';
import { AlertService } from '../alert-service';
import { LoadRequestActivityComponent } from '../load-request-activity/load-request-activity.component';
import { CreateLoadRequestModalComponent } from '../create-load-request-modal/create-load-request-modal.component';
import { LoadingService } from '../loading-service';
import { triggerExpandTableAnimation } from '../animations';
import { LoadRequestDetailComponent } from '../load-request-detail/load-request-detail.component';
import { LoadRequestMessageComponent } from '../load-request-message/load-request-message.component';
import { UserService } from '../user-service';
import { User } from '../model/user';
import { BindQueryParamDirective } from '../service/bind-query-param.directive';

@Component({
  selector: 'app-load-request',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    AsyncPipe,
    RouterModule,
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
    LoadRequestActivityComponent,
    LoadRequestDetailComponent,
    LoadRequestMessageComponent,
    BindQueryParamDirective,
  ],
  templateUrl: './load-request.component.html',
  animations: [triggerExpandTableAnimation],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  providers: [DatePipe],
})
export class LoadRequestComponent implements AfterViewInit {
  reloadAllRequests$ = new Subject();
  displayedColumns: string[] = [
    'requestId',
    'codeSystemName',
    'requestSubject',
    'requestStatus',
    'type',
    'requestTime',
    'requester',
    'creationTime',
  ];
  displayedColumnsForLargeScreen: string[] = [];

  columnsToDisplayWithExpand: WritableSignal<string[]> = signal([...this.displayedColumns]);

  loadRequestDatabase: LoadRequestDataSource | null = null;
  data: WritableSignal<LoadRequest[]> = signal([]);

  expandedElement: LoadRequest | null = null;
  user: User | null = null;

  resultsLength = 0;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  searchCriteria = new FormGroup(
    {
      requestId: new FormControl<number | null>(null),
      codeSystemName: new FormControl<string | null>(null, { updateOn: 'change' }),
      requestSubject: new FormControl<string | null>(null),
      type: new FormControl<string | null>(null, { updateOn: 'change' }),
      requestStatus: new FormControl<string | null>(null, { updateOn: 'change' }),
      requestTimeStart: new FormControl<Date | null>(null, { updateOn: 'change' }),
      requestTimeEnd: new FormControl<Date | null>(null, { updateOn: 'change' }),
      requestDateRange: new FormControl<string | null>(null, { updateOn: 'change' }),
      requestType: new FormControl<string | null>(null, { updateOn: 'change' }),
    }, { updateOn: 'submit' },
  );

  constructor(public http: HttpClient,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog,
              private breakpointObserver: BreakpointObserver,
              private loadingService: LoadingService,
              private userService: UserService,
              public alertService: AlertService) {
    userService.user$.subscribe(user => this.user = user);

    breakpointObserver
      .observe([
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntilDestroyed())
      .subscribe(result => {
        if (result.matches) {
          this.columnsToDisplayWithExpand.set([...this.displayedColumns, ...this.displayedColumnsForLargeScreen]);
        } else {
          this.columnsToDisplayWithExpand.set([...this.displayedColumns]);
        }
      });

    this.searchCriteria.valueChanges.subscribe(val => {
      this.router.navigate(['load-requests'], {
        queryParamsHandling: 'merge',
        queryParams: val,
      });
    });
  }

  ngAfterViewInit() {
    this.loadRequestDatabase = new LoadRequestDataSource(this.http);

    this.reloadAllRequests$.pipe(
      startWith(true),
      filter(reload => !!reload),
      switchMap(() => {
        return this.activatedRoute.queryParamMap.pipe(
          // query parameters are always string, convert to number if needed
          map((queryParams: Params) => {
            const qp = { ...queryParams['params'] };
            if (qp.requestId) {
              qp.requestId = parseInt(qp.requestId);
            }
            if (qp.pageNumber) {
              qp.pageNumber = parseInt(qp.pageNumber);
            }
            if (qp.pageSize) {
              qp.pageSize = parseInt(qp.pageSize);
            }
            return qp;
          }),
          map((qp): LoadRequestSearchCriteria => {
            const DEFAULT_SEARCH_CRITERIA: LoadRequestSearchCriteria = {
              requestId: null,
              codeSystemName: null,
              requestSubject: null,
              type: null,
              requestStatus: null,
              requestTime: null,
              requestDateRange: null,
              requester: null,
              sort: 'requestId',
              order: 'asc',
              pageNumber: 0,
              pageSize: 10,
            };
            const loadRequestSearchCriteria = Object.assign(DEFAULT_SEARCH_CRITERIA, qp);
            return loadRequestSearchCriteria;
          }),
          switchMap((loadRequestSearchCriteria) => {
            this.loadingService.showLoading();
            return this.loadRequestDatabase!.getLoadRequests(loadRequestSearchCriteria)
              .pipe(catchError(() => of(null)));
          }),
          map((data: LoadRequestsApiResponse | null) => {
            if (data === null) {
              return [];
            }
            this.resultsLength = data.total_count;
            return data.items;
          }),
          map(items => {
            items.forEach(item => item.numberOfMessages = item.loadRequestMessages ? item.loadRequestMessages.length : 0);
            return items;
          }),
          tap({
            next: data => {
              this.data.set(data);
              this.loadingService.hideLoading();
            },
            error: () => this.loadingService.hideLoading(),
          }),
        );
      }))
      .subscribe();
  }

  openCreateLoadRequestModal() {
    this.dialog.open(CreateLoadRequestModalComponent, {
      width: '700px',
    })
      .afterClosed()
      .pipe(
        filter(newLoadRequest => !!newLoadRequest),
        switchMap(newLoadRequest => this.http.post<{ requestId: string }>('/api/loadRequest', newLoadRequest)),
      )
      .subscribe({
        next: ({ requestId }) => {
          this.alertService.addAlert('info', `Request (ID: ${requestId}) created successfully`);
          this.reloadAllRequests$.next(true);
        },
        error: () => this.alertService.addAlert('danger', 'Error create load request.'),
      });
  }

  // @TODO get all pages
  download() {
    const blob = new Blob([JSON.stringify(this.data)], { type: 'application/json' });
    saveAs(blob, 'loadRequests-export.json');
    this.alertService.addAlert('', 'Export downloaded.');
  }

  handlePageEvent(e: PageEvent) {
    const { pageIndex, pageSize } = e;
    this.router.navigate(['load-requests'], {
      queryParamsHandling: 'merge',
      queryParams: {
        pageNumber: pageIndex,
        pageSize,
      },
    });
  }

  handleSortEvent(e: Sort) {
    const { active, direction } = e;

    this.router.navigate(['load-requests'], {
      queryParamsHandling: 'merge',
      queryParams: {
        pageNumber: 0,
        sort: active,
        order: direction,
      },
    });
  }

}
