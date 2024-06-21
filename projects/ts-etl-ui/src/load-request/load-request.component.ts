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
import { saveAs } from 'file-saver';

import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LoadRequestDataSource } from './load-request-data-source';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { catchError, filter, map, merge, of, startWith, Subject, switchMap, tap } from 'rxjs';

import { LoadRequest, LoadRequestsApiResponse } from '../model/load-request';
import { AlertService } from '../alert-service';
import { LoadRequestActivityComponent } from '../load-request-activity/load-request-activity.component';
import { CreateLoadRequestModalComponent } from '../create-load-request-modal/create-load-request-modal.component';
import { LoadingService } from '../loading-service';
import { triggerExpandTableAnimation } from '../animations';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadRequestDetailComponent } from '../load-request-detail/load-request-detail.component';
import { LoadRequestMessageComponent } from '../load-request-message/load-request-message.component';
import { UserService } from '../user-service';
import { User } from '../model/user';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '../navigation-service';

@Component({
  selector: 'app-load-request',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
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
    AsyncPipe,
    CommonModule,
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
      requestTime: new FormControl<string | null>(null, { updateOn: 'change' }),
      requestDateRange: new FormControl<string | null>(null, { updateOn: 'change' }),
      requestType: new FormControl<string | null>(null, { updateOn: 'change' }),
    }, { updateOn: 'submit' },
  );

  constructor(public http: HttpClient,
              public dialog: MatDialog,
              private breakpointObserver: BreakpointObserver,
              private loadingService: LoadingService,
              private userService: UserService,
              public alertService: AlertService,
              private activatedRoute: ActivatedRoute,
              private navigationService: NavigationService) {
    activatedRoute.title
      .pipe(
        tap({
          next: title => navigationService.tabs.forEach(tab => tab.isActive = tab.label === title),
        }),
      )
      .subscribe();
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
  }

  ngAfterViewInit() {
    this.loadRequestDatabase = new LoadRequestDataSource(this.http);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.searchCriteria.valueChanges.subscribe(() => this.paginator.pageIndex = 0);

    merge(
      this.reloadAllRequests$.pipe(filter(reload => !!reload)),
      this.searchCriteria.valueChanges,
      this.sort.sortChange,
      this.paginator.page,
    )
      .pipe(
        startWith({}),
        switchMap((filters) => {
          this.loadingService.showLoading();
          const sort = this.sort.active;
          const order = this.sort.direction;
          const pageNumber = this.paginator.pageIndex;
          const pageSize = this.paginator.pageSize;
          return this.loadRequestDatabase!.getLoadRequests(
            filters, sort, order, pageNumber, pageSize,
          ).pipe(catchError(() => of(null)));
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
          next: (data) => {
            this.data.set(data);
            this.loadingService.hideLoading();
          },
          error: () => this.loadingService.hideLoading(),
        }),
      )
      .subscribe();
  }

  openCreateLoadRequestModal() {
    this.dialog.open(CreateLoadRequestModalComponent, {
      width: '700px',
    })
      .afterClosed()
      .pipe(
        filter((newLoadRequest) => !!newLoadRequest),
        switchMap((newLoadRequest) => this.http.post<{ requestId: string }>('/loadRequest', newLoadRequest)),
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

  protected readonly event = event;
}
