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
import { default as _rollupMoment, Moment } from 'moment';
import { debounceTime, distinctUntilChanged, filter, map, startWith, Subject, switchMap, tap } from 'rxjs';

import { CreateLoadRequestModalComponent } from '../create-load-request-modal/create-load-request-modal.component';
import { environment } from '../environments/environment';
import { LoadComponentComponent } from '../load-component/load-component.component';
import { LoadComponentMessageComponent } from '../load-component-message/load-component-message.component';
import { LoadRequestDetailComponent } from '../load-request-detail/load-request-detail.component';
import {
  FlatLoadRequestPayload,
  generateLoadRequestPayload,
  LoadRequest,
  LoadRequestPayload, LoadRequestSearchForm,
  LoadRequestsResponse,
} from '../model/load-request';
import { User } from '../model/user';
import { AlertService } from '../service/alert-service';
import { ConstantService } from '../service/constant-service';
import { DownloadService } from '../service/download-service';
import { EasternTimePipe } from '../service/eastern-time.pipe';
import { UserService } from '../service/user-service';

const moment = _rollupMoment;

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
    MatOptionModule,
    MatSelectModule,
    LoadComponentComponent,
    LoadRequestDetailComponent,
    LoadComponentMessageComponent,
  ],
  templateUrl: './load-request.component.html',
  styleUrls: ['./load-request.component.scss'],
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

  columnsToDisplay: WritableSignal<string[]> = signal([...this.displayedColumns]);

  data: WritableSignal<LoadRequest[]> = signal([]);

  user: User | null | undefined = undefined;

  resultsLength = 0;
  resultsPageSize = 10;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  searchCriteria = new FormGroup(
    {
      opRequestSeq: new FormControl<string | null>(null, { updateOn: 'submit' }),
      codeSystemName: new FormControl<string[] | null | undefined>(null, { updateOn: 'submit' }),
      requestSubject: new FormControl<string | null>(null, { updateOn: 'submit' }),
      requestStatus: new FormControl<string[] | null | undefined>(null, { updateOn: 'submit' }),
      requestType: new FormControl<string[] | null | undefined>(null, { updateOn: 'submit' }),
      requestTimeFrom: new FormControl<Moment | string | null>(null, { updateOn: 'submit' }),
      requestTimeTo: new FormControl<Moment | string | null>(null, { updateOn: 'submit' }),
      requester: new FormControl<string | null>(null, { updateOn: 'submit' }),
      creationTimeFrom: new FormControl<Moment | string | null>(null, { updateOn: 'submit' }),
      creationTimeTo: new FormControl<Moment | string | null>(null, { updateOn: 'submit' }),
      filterRequestTime: new FormControl<string | null>(null, { updateOn: 'change' }),
      filterRequester: new FormControl<string | null>(null, { updateOn: 'change' }),
    },
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

  formChanged$ = this.searchCriteria.valueChanges.pipe(
    debounceTime(500),
    distinctUntilChanged(),
    tap({
      next: val => {
        const queryParams = { pageNum: null, ...val };
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
      },
    }),
  );

  constructor(private http: HttpClient,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private userService: UserService,
              public constantService: ConstantService,
              private alertService: AlertService,
              private downloadService: DownloadService) {
    userService.user$.subscribe(user => this.user = user);
    this.formChanged$.subscribe();
  }

  ngAfterViewInit() {
    this.reloadAllRequests$.pipe(
      startWith(true),
      filter(reload => !!reload),
      switchMap(() => {
        return this.activatedRoute.queryParamMap.pipe(
          // update UI from query parameters
          map((queryParams: Params) => {
            const searchCriteriaFromQueryParameter: FlatLoadRequestPayload = {
              opRequestSeq: queryParams.get('opRequestSeq'),
              codeSystemName: queryParams.getAll('codeSystemName'),
              requestSubject: queryParams.get('requestSubject'),
              requestStatus: queryParams.getAll('requestStatus'),
              requestType: queryParams.getAll('requestType'),
              requestTimeFrom: queryParams.get('requestTimeFrom'),
              requestTimeTo: queryParams.get('requestTimeTo'),
              requester: queryParams.get('requester'),
              creationTimeFrom: queryParams.get('creationTimeFrom'),
              creationTimeTo: queryParams.get('creationTimeTo'),
              filterRequestTime: queryParams.get('filterRequestTime'),
              filterRequester: queryParams.get('filterRequester'),
              pageNum: Number(queryParams.get('pageNum')),
              pageSize: Number(queryParams.get('pageSize')),
              sortBy: queryParams.get('sortBy'),
              sortDirection: queryParams.get('sortDirection'),
            };

            const loadRequestSearchForm = { ...searchCriteriaFromQueryParameter };
            this.updateSearchFormWhenQueryParameterChanged(loadRequestSearchForm);
            return searchCriteriaFromQueryParameter;
          }),
          switchMap((qp) => {
            const loadRequestPayload: LoadRequestPayload = generateLoadRequestPayload(qp);
            // store current search/filter criteria for download
            assign(this.currentLoadRequestSearchCriteria, loadRequestPayload);
            return this.http.post<LoadRequestsResponse>(`${environment.apiServer}/load-request/list`, this.currentLoadRequestSearchCriteria);
          }),
          map((res: LoadRequestsResponse) => {
            this.resultsLength = res.result.pagination.totalCount!;
            this.resultsPageSize = res.result.pagination.pageSize!;
            return res?.result.data;
          }),
          tap({
            next: data => {
              this.data.set(data);
            },
          }),
        );
      }))
      .subscribe();
  }

  /**
   * @TODO find an elegant way to patch the entire form without trigger valueChanges
   * If you patch the entire reactive form at once, even with `emitEvent: false`, there will be many valueChange triggered, one per changes.
   * I had to patch reactive form's individual property with `emitEvent: false` so it doesn't propagate the valueChange.
   */
  private updateSearchFormWhenQueryParameterChanged = (searchCriteriaPatch: LoadRequestSearchForm) => {
    if (searchCriteriaPatch.opRequestSeq) {
      this.searchCriteria.controls.opRequestSeq.patchValue(searchCriteriaPatch.opRequestSeq, {
        emitEvent: false,
      });
    }
    this.searchCriteria.controls.codeSystemName.patchValue(searchCriteriaPatch.codeSystemName, {
      emitEvent: false,
    });
    if (searchCriteriaPatch.requestSubject) {
      this.searchCriteria.controls.requestSubject.patchValue(searchCriteriaPatch.requestSubject, {
        emitEvent: false,
      });
    }
    this.searchCriteria.controls.requestStatus.patchValue(searchCriteriaPatch.requestStatus, {
      emitEvent: false,
    });
    this.searchCriteria.controls.requestType.patchValue(searchCriteriaPatch.requestType, {
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
  };

  openCreateLoadRequestModal() {
    this.dialog.open(CreateLoadRequestModalComponent, {
      width: '700px',
    })
      .afterClosed()
      .pipe(
        tap(() => this.reloadAllRequests$.next(true))
      )
      .subscribe();
  }

  download() {
    this.http.post<LoadRequestsResponse>(`${environment.apiServer}/load-request/list`,
      Object.assign(this.currentLoadRequestSearchCriteria, {
          pagination: {
            pageNum: 1,
            pageSize: this.resultsLength,
          },
        },
      ))
      .pipe(
        map(data => {
          const headerList = [...this.columnsToDisplay()];
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
