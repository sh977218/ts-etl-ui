import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  signal,
  ViewChild,
  ViewEncapsulation,
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
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { catchError, filter, map, of, startWith, Subject, switchMap, tap } from 'rxjs';

import { triggerExpandTableAnimation } from '../animations';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CreateLoadRequestModalComponent } from '../create-load-request-modal/create-load-request-modal.component';
import { environment } from '../environments/environment';
import { LoadRequestActivityComponent } from '../load-request-activity/load-request-activity.component';
import { LoadRequestDetailComponent } from '../load-request-detail/load-request-detail.component';
import { LoadRequestMessageComponent } from '../load-request-message/load-request-message.component';
import {
  CreateLoadRequestsResponse,
  FlatLoadRequestPayload,
  generateLoadRequestPayload,
  LoadRequest,
  LoadRequestPayload,
  LoadRequestsResponse,
} from '../model/load-request';
import { User } from '../model/user';
import { AlertService } from '../service/alert-service';
import { ConstantService } from '../service/constant-service';
import { DownloadService } from '../service/download-service';
import { EasternTimePipe } from '../service/eastern-time.pipe';
import { LoadingService } from '../service/loading-service';
import { UserService } from '../service/user-service';

const moment = _rollupMoment || _moment;

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    AsyncPipe,
    RouterModule,
    CommonModule,
    EasternTimePipe,
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
  styleUrls: ['./load-request.component.scss'],
  animations: [triggerExpandTableAnimation],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
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
      opRequestSeq: new FormControl<string | null>(null),
      codeSystemName: new FormControl<string | null>(null, { updateOn: 'change' }),
      requestSubject: new FormControl<string | null>(null),
      requestStatus: new FormControl<string | null>(null, { updateOn: 'change' }),
      requestType: new FormControl<string | null>(null, { updateOn: 'change' }),
      requestTimeFrom: new FormControl<Moment | string | null>(null),
      requestTimeTo: new FormControl<Moment | string | null>(null),
      requester: new FormControl<string | null>(null),
      creationTimeFrom: new FormControl<Moment | string | null>(null),
      creationTimeTo: new FormControl<Moment | string | null>(null),
      filterRequestTime: new FormControl<string | null>(null, { updateOn: 'change' }),
      filterRequester: new FormControl<string | null>(null),
    }, { updateOn: 'submit' },
  );

  currentLoadRequestSearchCriteria: LoadRequestPayload = {
    pagination: {
      pageNum: 1,
      pageSize: 10,
    },
    searchFilters: {},
    searchColumns: {},
    sortCriteria: {
      sortDirection: 'asc',
      sortBy: 'requestSubject',
    },
  };

  constructor(private http: HttpClient,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private loadingService: LoadingService,
              private userService: UserService,
              public constantService: ConstantService,
              private alertService: AlertService,
              private downloadService: DownloadService) {
    userService.user$.subscribe(user => this.user = user);
    this.searchCriteria.valueChanges
      .subscribe(val => {
        const queryParams = { expand: undefined, ...val };
        const requestTimeFrom = val.requestTimeFrom;
        if (requestTimeFrom) {
          queryParams.requestTimeFrom = (requestTimeFrom as Moment).toISOString();
        }
        const requestTimeTo = val.requestTimeTo;
        if (requestTimeTo) {
          queryParams.requestTimeTo = (requestTimeTo as Moment).toISOString();
        }
        const creationTimeFrom = val.creationTimeFrom;
        if (creationTimeFrom) {
          queryParams.creationTimeFrom = (creationTimeFrom as Moment).toISOString();
        }
        const creationTimeTo = val.creationTimeTo;
        if (creationTimeTo) {
          queryParams.creationTimeTo = (creationTimeTo as Moment).toISOString();
        }
        this.router.navigate(['load-requests'], {
          queryParamsHandling: 'merge',
          queryParams,
        });
      });
  }

  ngAfterViewInit() {
    this.reloadAllRequests$.pipe(
      startWith(true),
      filter(reload => !!reload),
      switchMap(() => {
        return this.activatedRoute.queryParamMap.pipe(
          tap({ next: () => this.loadingService.showLoading() }),
          // update UI from query parameters
          map((queryParams: Params) => {
            const searchCriteriaFromQueryParameter: FlatLoadRequestPayload = {
              opRequestSeq: queryParams.get('opRequestSeq'),
              codeSystemName: queryParams.get('codeSystemName'),
              requestSubject: queryParams.get('requestSubject'),
              requestStatus: queryParams.get('requestStatus'),
              requestType: queryParams.get('requestType'),
              requestTimeFrom: queryParams.get('requestTimeFrom'),
              requestTimeTo: queryParams.get('requestTimeTo'),
              requester: queryParams.get('requester'),
              creationTimeFrom: queryParams.get('creationTimeFrom'),
              creationTimeTo: queryParams.get('creationTimeTo'),
              filterRequestTime: queryParams.get('filterRequestTime'),
              filterRequester: queryParams.get('filterRequester'),
              pageNum: queryParams.get('pageNum'),
              pageSize: queryParams.get('pageSize'),
              sortBy: queryParams.get('sortBy'),
              sortDirection: queryParams.get('sortDirection'),
            };

            /*
            @TODO find an elegant way to patch the entire form without trigger valueChanges
             If you patch the entire reactive form, even with `emitEvent: false`, there will be many valueChange triggered, one per changes.
             I had to patch reactive form's individual property with `emitEvent: false` so it doesn't propagate the valueChange.
           */
            const searchCriteriaPatch = { ...searchCriteriaFromQueryParameter };
            if (searchCriteriaPatch.opRequestSeq) {
              this.searchCriteria.controls.opRequestSeq.patchValue(searchCriteriaPatch.opRequestSeq, {
                emitEvent: false,
              });
            }
            this.searchCriteria.controls.codeSystemName.patchValue(searchCriteriaPatch.codeSystemName || '', {
              emitEvent: false,
            });
            if (searchCriteriaPatch.requestSubject) {
              this.searchCriteria.controls.requestSubject.patchValue(searchCriteriaPatch.requestSubject, {
                emitEvent: false,
              });
            }
            this.searchCriteria.controls.requestStatus.patchValue(searchCriteriaPatch.requestStatus || '', {
              emitEvent: false,
            });
            this.searchCriteria.controls.requestType.patchValue(searchCriteriaPatch.requestType || '', {
              emitEvent: false,
            });
            if (searchCriteriaPatch.requestTimeFrom) {
              this.searchCriteria.controls.requestTimeFrom.patchValue(moment(searchCriteriaPatch.requestTimeFrom), {
                emitEvent: false,
              });
            }
            if (searchCriteriaPatch.requestTimeTo) {
              this.searchCriteria.controls.requestTimeTo.patchValue(moment(searchCriteriaPatch.requestTimeTo), {
                emitEvent: false,
              });
            }
            if (searchCriteriaPatch.requester) {
              this.searchCriteria.controls.requester.patchValue(searchCriteriaPatch.requester, {
                emitEvent: false,
              });
            }
            if (searchCriteriaPatch.creationTimeFrom) {
              this.searchCriteria.controls.creationTimeFrom.patchValue(moment(searchCriteriaPatch.creationTimeFrom), {
                emitEvent: false,
              });
            }
            if (searchCriteriaPatch.creationTimeTo) {
              this.searchCriteria.controls.creationTimeTo.patchValue(moment(searchCriteriaPatch.creationTimeTo), {
                emitEvent: false,
              });
            }
            if (searchCriteriaPatch.filterRequestTime) {
              this.searchCriteria.controls.filterRequestTime.patchValue(searchCriteriaPatch.filterRequestTime, {
                emitEvent: false,
              });
            }

            return searchCriteriaFromQueryParameter;
          }),
          switchMap((qp) => {
            const loadRequestPayload: LoadRequestPayload = generateLoadRequestPayload(qp);
            // store current search/filter criteria for download
            assign(this.currentLoadRequestSearchCriteria, loadRequestPayload);
            return this.http.post<LoadRequestsResponse>(`${environment.newApiServer}/load-request/list`, this.currentLoadRequestSearchCriteria)
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
        switchMap(newLoadRequest => this.http.post<CreateLoadRequestsResponse>(`${environment.newApiServer}/load-request`, newLoadRequest as LoadRequest)),
        map(res => res.result.data),
        tap({
          next: (opRequestSeq) => {
            this.alertService.addAlert('info', `Request (ID: ${opRequestSeq}) created successfully`);
            this.reloadAllRequests$.next(true);
          },
          error: () => this.alertService.addAlert('danger', 'Error create load request.'),
        }),
      )
      .subscribe();
  }

  openCancelDialog(reqId: number) {
    this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
    })
      .afterClosed()
      .pipe(
        filter((dialogResult: boolean) => dialogResult),
        switchMap(() => this.http.post(`${environment.newApiServer}/loadRequest/${reqId}`, {})),
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

}
