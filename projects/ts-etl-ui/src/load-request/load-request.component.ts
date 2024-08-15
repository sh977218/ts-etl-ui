import { AsyncPipe, CommonModule, DatePipe, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit, ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA,
  signal, ViewChild,
  WritableSignal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { saveAs } from 'file-saver';
import { assign } from 'lodash';
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

import { triggerExpandTableAnimation } from '../animations';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CreateLoadRequestModalComponent } from '../create-load-request-modal/create-load-request-modal.component';
import { environment } from '../environments/environment';
import { LoadRequestActivityComponent } from '../load-request-activity/load-request-activity.component';
import { LoadRequestDetailComponent } from '../load-request-detail/load-request-detail.component';
import { LoadRequestMessageComponent } from '../load-request-message/load-request-message.component';
import {
  generateLoadRequestPayload,
  LoadRequest,
  LoadRequestPayload,
  LoadRequestsResponse,
} from '../model/load-request';
import { User } from '../model/user';
import { AlertService } from '../service/alert-service';
import { CODE_SYSTEM_NAMES, LOAD_REQUEST_STATUSES, LOAD_REQUEST_TYPES } from '../service/constant';
import { DownloadService } from '../service/download-service';
import { LoadingService } from '../service/loading-service';
import { UserService } from '../service/user-service';


@Component({
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
    MatDatepickerModule,
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
    'opRequestSeq',
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
  user: User | null | undefined = undefined;

  resultsLength = 0;
  resultsPageSize = 10;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  searchCriteria = new FormGroup(
    {
      opRequestSeq: new FormControl(),
      codeSystemName: new FormControl(null, { updateOn: 'change' }),
      requestSubject: new FormControl(),
      requestStatus: new FormControl(null, { updateOn: 'change' }),
      requestType: new FormControl(null, { updateOn: 'change' }),
      requestTimeFrom: new FormControl(),
      requestTimeTo: new FormControl(),
      requester: new FormControl(),
      creationTimeFrom: new FormControl(),
      creationTimeTo: new FormControl(),
      filterRequestTime: new FormControl(null, { updateOn: 'change' }),
      filterRequester: new FormControl(),
    }, { updateOn: 'submit' },
  );

  currentLoadRequestSearchCriteria: LoadRequestPayload = {
    pagination: {
      pageNum: 1,
      pageSize: 10,
    },
    searchFilters: {
      filterRequestTime: '',
      filterRequester: '',
    },
    searchColumns: {
      opRequestSeq: '',
      codeSystemName: '',
      requestSubject: '',
      requestStatus: '',
      requestType: '',
      requester: '',
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
//            const searchCriteriaFromQueryParameter = new LoadRequestSearchCriteria(qp);
//            this.searchCriteria.patchValue(searchCriteriaFromQueryParameter as any, { emitEvent: false });
            return qp;
          }),
          map((qp): LoadRequestPayload => {
            const loadRequestPayload: LoadRequestPayload = generateLoadRequestPayload(qp);
            assign(this.currentLoadRequestSearchCriteria, loadRequestPayload);
            return this.currentLoadRequestSearchCriteria;
          }),
          switchMap((loadRequestPayload) => {
            this.loadingService.showLoading();
            return this.http.post<LoadRequestsResponse>(`${environment.newApiServer}/load-request/list`, loadRequestPayload)
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
              const expand = this.activatedRoute.snapshot.queryParams['expand'];
              if (expand) {
                this.expandedElement = this.data().at(Number.parseInt(expand) || 0);
              }
              this.loadingService.hideLoading();
            },
            error: () => this.loadingService.hideLoading(),
          }),
        );
      }))
      .subscribe();
  }

  expandRow(row: LoadRequest | null | undefined) {
    this.expandedElement = this.expandedElement === row ? null : row;
  }

  openCreateLoadRequestModal() {
    this.dialog.open(CreateLoadRequestModalComponent, {
      width: '700px',
    })
      .afterClosed()
      .pipe(
        filter(newLoadRequest => !!newLoadRequest),
        switchMap(newLoadRequest => this.http.post<{
          opRequestSeq: string
        }>(`${environment.apiServer}/loadRequest`, newLoadRequest as LoadRequest)),
      )
      .subscribe({
        next: ({ opRequestSeq }) => {
          this.alertService.addAlert('info', `Request (ID: ${opRequestSeq}) created successfully`);
          this.reloadAllRequests$.next(true);
        },
        error: () => this.alertService.addAlert('danger', 'Error create load request.'),
      });
  }

  openCancelDialog(reqId: number) {
    this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
    })
      .afterClosed()
      .pipe(
        filter((dialogResult: boolean) => dialogResult),
        switchMap(() => this.http.delete(`${environment.apiServer}/loadRequest/${reqId}`)),
      )
      .subscribe({
        next: () => {
          this.alertService.addAlert('info', `Request (ID: ${reqId}) deleted successfully`);
          this.reloadAllRequests$.next(true);
        },
      });
  }

  openEditDialog(loadRequest: LoadRequest) {
    this.dialog.open(CreateLoadRequestModalComponent, {
      width: '700px',
      data: loadRequest,
    })
      .afterClosed()
      .pipe(
        filter(newLoadRequest => !!newLoadRequest),
        switchMap(newLoadRequest => this.http.post<LoadRequest>
        (`${environment.apiServer}/loadRequest/${loadRequest.opRequestSeq}`, newLoadRequest as LoadRequest)),
      )
      .subscribe({
        next: (newLR) => {
          this.alertService.addAlert('info', `Request (ID: ${newLR.opRequestSeq}) edited successfully`);
          // this.reloadAllRequests$.next(true);
          const currentData = this.data();
          const index = currentData.findIndex((lr: LoadRequest) => lr.opRequestSeq === newLR.opRequestSeq);
          const updatedData = [
            ...currentData.slice(0, index),
            newLR,
            ...currentData.slice(index + 1),
          ];
          this.data.set(updatedData);
          this.expandedElement = this.data().at(index);
        },
        error: () => this.alertService.addAlert('danger', 'Error editing load request.'),
      });
  }

  download() {
    this.http.post<LoadRequestsResponse>(`${environment.newApiServer}/load-request/list`,
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
        // mat paginator is 0 base index, but API expect 1 base index.
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
        sortBy: active,
        sortDirection: direction,
      },
    });
  }

  protected readonly CODE_SYSTEM_NAMES = CODE_SYSTEM_NAMES;
  protected readonly LOAD_REQUEST_STATUSES = LOAD_REQUEST_STATUSES;
  protected readonly LOAD_REQUEST_TYPES = LOAD_REQUEST_TYPES;
}
