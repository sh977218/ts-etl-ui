import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA, signal,
  ViewChild, WritableSignal
} from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';

import { MatTableModule, } from '@angular/material/table';
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
import { catchError, filter, map, merge, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';

import { LoadRequest, LoadRequestsApiResponse } from '../model/load-request';
import { AlertService } from '../alert-service';
import { LoadRequestActivityComponent } from '../load-request-activity/load-request-activity.component';
import { CreateLoadRequestModalComponent } from '../create-load-request-modal/create-load-request-modal.component';
import { LoadingService } from "../loading-service";
import { triggerExpandTableAnimation } from "../animations";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

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
    AsyncPipe
  ],
  templateUrl: './load-request.component.html',
  animations: [triggerExpandTableAnimation],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class LoadRequestComponent implements AfterViewInit {
  destroyed = new Subject<void>();


  reloadAllRequests$ = new Subject();
  displayedColumns: string[] = [
    'requestId',
    'type',
    'codeSystemName',
    'sourceFilePath',
    'requestSubject',
    'requestStatus',
    'version',
    'availableDate',
    'requester',
  ];

  displayedColumnsForLargeScreen: string[] = ['requestTime']

  columnsToDisplayWithExpand:WritableSignal<string[]> = signal([...this.displayedColumns, 'expand']);

  loadRequestDatabase: LoadRequestDataSource | null = null;
  data: WritableSignal<LoadRequest[]> = signal([]);

  expandedElement: LoadRequest | null = null;

  resultsLength = 0;

  @ViewChild(MatPaginator, {static: false}) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort!: MatSort;

  searchCriteria = new FormGroup(
    {
      filters: new FormGroup({requestId: new FormControl()}),
      requestDateType: new FormControl(0),
      requestType: new FormControl(0),
    }, {updateOn: 'submit',}
  );

  constructor(private _httpClient: HttpClient,
              public dialog: MatDialog,
              private breakpointObserver: BreakpointObserver,
              private loadingService: LoadingService,
              public alertService: AlertService) {
    breakpointObserver
      .observe([
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        if (result.matches) {
          this.columnsToDisplayWithExpand.set([...this.displayedColumns, ...this.displayedColumnsForLargeScreen, 'expand']);
        } else {
          this.columnsToDisplayWithExpand.set([...this.displayedColumns, 'expand']);
        }
      });

  }

  ngAfterViewInit() {
    this.loadRequestDatabase = new LoadRequestDataSource(this._httpClient);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.searchCriteria.valueChanges.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.reloadAllRequests$.pipe(filter(reload => !!reload)),
      this.searchCriteria.valueChanges,
      this.sort.sortChange,
      this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.loadingService.showLoading();
          const filters = this.searchCriteria.get('filters')?.getRawValue() || '';
          const sort = this.sort.active;
          const order = this.sort.direction;
          const pageNumber = this.paginator.pageIndex;
          const pageSize = this.paginator.pageSize
          return this.loadRequestDatabase!.getLoadRequests(
            filters, sort, order, pageNumber, pageSize
          ).pipe(catchError(() => of(null)));
        }),
        map((data: LoadRequestsApiResponse | null) => {
          if (data === null) {
            return [];
          }

          this.resultsLength = data.total_count;
          return data.items;
        }),
      )
      .subscribe(data => {
        this.data.set(data);
        this.loadingService.hideLoading()
      });
  }

  openCreateLoadRequestModal() {
    this.dialog.open(CreateLoadRequestModalComponent, {
      width: '700px'
    })
      .afterClosed()
      .subscribe({
        next: res => {
          if (res === 'success') {
            this.alertService.addAlert('info', 'Successfully created load request.')
            this.reloadAllRequests$.next(true);
          } else if (res === 'error') {
            this.alertService.addAlert('danger', 'Error create load request.')
          }
        }
      });
  }

  fetchLoadRequestActivity(event: MouseEvent, loadRequest: LoadRequest) {
    this.expandedElement = this.expandedElement === loadRequest ? null : loadRequest
    event.stopPropagation();
  }

  // @TODO get all pages
  download() {
    const blob = new Blob([JSON.stringify(this.data)], {type: 'application/json'});
    saveAs(blob, 'loadRequests-export.json');
    this.alertService.addAlert('', 'Export downloaded.');
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
