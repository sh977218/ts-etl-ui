import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker
} from '@angular/material/datepicker';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  catchError, debounceTime, distinctUntilChanged, map, merge, of, pairwise, startWith, switchMap, tap
} from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { LoadRequest, LoadRequestsApiResponse } from '../model/load-request';
import { LoadRequestDataSource } from './load-request-data-source';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { CreateLoadRequestModalComponent } from '../create-load-request-modal/create-load-request-modal.component';
import { MatSelect } from '@angular/material/select';
import { AlertService } from '../alert-service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { LoadRequestActivityComponent } from '../load-request-activity/load-request-activity.component';

@Component({
  selector: 'app-load-request',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderRowDef,
    MatNoDataRow,
    MatInput,
    MatButton,
    MatIcon,
    MatIconButton,
    MatDatepicker,
    MatDatepickerToggle,
    MatDatepickerInput,
    MatDateRangeInput,
    MatDateRangePicker,
    MatProgressSpinner,
    MatDatepickerModule,
    NgIf,
    MatSort,
    MatSortHeader,
    MatPaginator,
    MatLabel,
    MatSuffix,
    MatFabButton,
    MatCheckbox,
    MatOption,
    MatSelect,
    LoadRequestActivityComponent
  ],
  templateUrl: './load-request.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  styleUrl: './load-request.component.scss',
  providers: [provideNativeDateAdapter()],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class LoadRequestComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'requestId',
    'codeSystemName',
    'sourceFilePath',
    'requestSubject',
    'requestStatus',
    'version',
    'availableDate',
    'requester',
    'requestTime'
  ];
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];

  loadRequestDatabase: LoadRequestDataSource | null = null;
  data: LoadRequest[] = [];

  expandedElement: LoadRequest | null = null;

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator, {static: false}) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort!: MatSort;

  searchCriteria = new FormGroup(
    {
      filterTerm: new FormControl<string | null>(null),
      requestDateType: new FormControl(0),
      requestType: new FormControl(0),
    },
    {updateOn: 'submit'}
  );


  constructor(private _httpClient: HttpClient,
              public dialog: MatDialog,
              public alertService: AlertService) {
  }


  ngAfterViewInit() {
    this.loadRequestDatabase = new LoadRequestDataSource(this._httpClient);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.searchCriteria.valueChanges.pipe(
        debounceTime(150),
        distinctUntilChanged(),
        startWith(null),
        pairwise(),
        tap({
          next: () => this.paginator.firstPage(),
        })
      ),
      this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          const filter = this.searchCriteria.getRawValue().filterTerm || '';
          const sort = this.sort.active;
          const order = this.sort.direction;
          const pageNumber = this.paginator.pageIndex;
          const pageSize = this.paginator.pageSize
          return this.loadRequestDatabase!.getLoadRequests(
            filter, sort, order, pageNumber, pageSize
          ).pipe(catchError(() => of(null)));
        }),
        map((data: LoadRequestsApiResponse | null) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }

          // Only refresh the result length if there is new data. In case of rate
          // limit errors, we do not want to reset the paginator to zero, as that
          // would prevent users from re-triggering requests.
          this.resultsLength = data.total_count;
          return data.items;
        }),
      )
      .subscribe(data => (this.data = data));
  }

  onSubmit() {
    this.searchCriteria.updateValueAndValidity({onlySelf: false, emitEvent: true});
  }

  onClear() {
    this.searchCriteria.get('filterTerm')?.reset('', {emitEvent: false});
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
}
