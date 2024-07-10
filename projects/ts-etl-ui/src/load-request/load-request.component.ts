import {
  AfterViewInit, ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, signal, ViewChild,
  WritableSignal,
} from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
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
import {
  catchError,
  filter,
  map,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { saveAs } from 'file-saver';
import { assign } from 'lodash';

import { triggerExpandTableAnimation } from '../animations';
import { LoadingService } from '../service/loading-service';
import { UserService } from '../service/user-service';
import { DownloadService } from '../service/download-service';
import { AlertService } from '../service/alert-service';
import {
  generateLoadRequestPayload,
  LoadRequest,
  LoadRequestPayload,
  LoadRequestsResponse,
} from '../model/load-request';
import { User } from '../model/user';

import { LoadRequestActivityComponent } from '../load-request-activity/load-request-activity.component';
import { CreateLoadRequestModalComponent } from '../create-load-request-modal/create-load-request-modal.component';
import { LoadRequestDetailComponent } from '../load-request-detail/load-request-detail.component';
import { LoadRequestMessageComponent } from '../load-request-message/load-request-message.component';
import { CODE_SYSTEM_NAMES, LOAD_REQUEST_STATUSES, LOAD_REQUEST_TYPES } from '../service/constant';
import { environment } from '../environments/environment';


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
    'requestType',
    'requestTime',
    'requester',
    'creationTime',
  ];
  searchRowColumns = this.displayedColumns.map(c => `${c}-search`);

  columnsToDisplayWithExpand: WritableSignal<string[]> = signal([...this.displayedColumns]);

  data: WritableSignal<LoadRequest[]> = signal([]);

  expandedElement: LoadRequest | null | undefined = null;
  user: User | null = null;

  resultsLength = 0;
  resultsPageSize = 10;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  searchCriteria = new FormGroup(
    {
      requestId: new FormControl<number | undefined>(undefined),
      codeSystemName: new FormControl<string | undefined>('', { updateOn: 'change' }),
      requestSubject: new FormControl<string | undefined>(''),
      requestStatus: new FormControl<string | undefined>('', { updateOn: 'change' }),
      requestType: new FormControl<string | undefined>('', { updateOn: 'change' }),
      requestStartTime: new FormControl<Date | undefined>(undefined),
      requestEndTime: new FormControl<Date | undefined>(undefined),
      requester: new FormControl<Date | undefined>(undefined),
      creationStartTime: new FormControl<Date | undefined>(undefined),
      creationEndTime: new FormControl<Date | undefined>(undefined),
      filterRequestTime: new FormControl<string | undefined>('', { updateOn: 'change' }),
      filterRequester: new FormControl<string | undefined>(''),
    }, { updateOn: 'submit' },
  );

  currentLoadRequestSearchCriteria: LoadRequestPayload = {
    pagination: {
      pageNum: 0,
      pageSize: 10,
    },
    searchFilters: {
      filterRequestTime: '',
      filterRequester: '',
    },
    searchColumns: {
      requestId: '',
      codeSystemName: '',
      requestSubject: '',
      requestStatus: '',
      requestType: '',
      requestStartTime: '',
      requestEndTime: '',
      requester: '',
      creationStartTime: '',
      creationEndTime: '',
    },
    sortCriteria: {
      sortDirection: 'asc',
      sortBy: 'requestSubject',
    },
  };

  constructor(public http: HttpClient,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog,
              private loadingService: LoadingService,
              private userService: UserService,
              public alertService: AlertService,
              private downloadService: DownloadService) {
    userService.user$.subscribe(user => this.user = user);
    this.searchCriteria.valueChanges
      .subscribe(val => {
        this.router.navigate(['load-requests'], {
          queryParamsHandling: 'merge',
          queryParams: { expand: undefined, ...val },
        });
      });
  }

  ngAfterViewInit() {
    this.reloadAllRequests$.pipe(
      startWith(true),
      filter(reload => !!reload),
      switchMap(() => {
        return this.activatedRoute.queryParamMap.pipe(
          // query parameters are always string, convert to number if needed
          map((queryParams: Params) => {
            const qp = { ...queryParams['params'] };
            // update UI from query parameters
            this.searchCriteria.patchValue(qp, { emitEvent: false });
            if (qp.pageNum) {
              this.paginator.pageIndex = qp.pageNum - 1;
            }
            this.paginator.pageSize = qp.pageSize || 10;
            return qp;
          }),
          map((qp): LoadRequestPayload => {
            const loadRequestPayload: LoadRequestPayload = generateLoadRequestPayload(qp);
            assign(this.currentLoadRequestSearchCriteria, loadRequestPayload);
            return this.currentLoadRequestSearchCriteria;
          }),
          switchMap((loadRequestPayload) => {
            this.loadingService.showLoading();
            return this.http.post<LoadRequestsResponse>(`${environment.apiServer}/api/loadRequests`, loadRequestPayload)
              .pipe(catchError(() => of(null)));
          }),
          map((res: LoadRequestsResponse | null) => {
            if (res?.result === null) {
              return [];
            }
            this.resultsLength = res?.result.pagination.totalCount || 0;
            this.resultsPageSize = res?.result.pagination.pageSize || 10;
            return res?.result.data || [];
          }),
          map(items => {
            items.forEach(item => item.numberOfMessages = item.loadRequestMessages ? item.loadRequestMessages.length : 0);
            return items;
          }),
          tap({
            next: data => {
              this.data.set(data);
              if (this.activatedRoute.snapshot.queryParams['expand'] === 'true') {
                this.expandedElement = this.data().at(0);
              }
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
        switchMap(newLoadRequest => this.http.post<{
          requestId: string
        }>(`${environment.apiServer}/api/loadRequest`, newLoadRequest as LoadRequest)),
      )
      .subscribe({
        next: ({ requestId }) => {
          this.alertService.addAlert('info', `Request (ID: ${requestId}) created successfully`);
          this.reloadAllRequests$.next(true);
        },
        error: () => this.alertService.addAlert('danger', 'Error create load request.'),
      });
  }

  download() {
    this.http.post<LoadRequestsResponse>(`${environment.apiServer}/api/loadRequests`,
      Object.assign(this.currentLoadRequestSearchCriteria, {
          pagination: {
            pageNum: 1,
            pageSize: this.resultsLength,
          },
        },
      ))
      .pipe(
        map(data => {
          const headerList = [...this.columnsToDisplayWithExpand()];
          return this.downloadService.generateBlob(headerList, data.result.data);
        }),
        tap({
          next: (blob) => {
            saveAs(blob, 'loadRequests-export.csv');
            this.alertService.addAlert('', 'Export downloaded.');
          },
          error: () => this.alertService.addAlert('', 'Export download failed.'),
        }))
      .subscribe();
  }

  handlePageEvent(e: PageEvent) {
    const { pageIndex, pageSize } = e;
    this.router.navigate(['load-requests'], {
      queryParamsHandling: 'merge',
      queryParams: {
        pageNum: pageIndex + 1,
        pageSize,
      },
    });
  }

  handleSortEvent(e: Sort) {
    const { active, direction } = e;
    this.router.navigate(['load-requests'], {
      queryParamsHandling: 'merge',
      queryParams: {
        pageNum: 1,
        sort: active,
        order: direction,
      },
    });
  }

  protected readonly CODE_SYSTEM_NAMES = CODE_SYSTEM_NAMES;
  protected readonly LOAD_REQUEST_STATUSES = LOAD_REQUEST_STATUSES;
  protected readonly LOAD_REQUEST_TYPES = LOAD_REQUEST_TYPES;
}
