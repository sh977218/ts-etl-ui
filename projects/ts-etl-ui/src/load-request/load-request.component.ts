import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';

import {
  MatTableModule,
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
  catchError, map, merge, of, startWith, switchMap
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
    MatTableModule,
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

  @ViewChild(MatPaginator, {static: false}) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort!: MatSort;

  searchCriteria = new FormGroup(
    {
      filterTerm: new FormControl(''),
      requestDateType: new FormControl(0),
      requestType: new FormControl(0),
    }, {updateOn: 'submit',}
  );

  constructor(private _httpClient: HttpClient,
              public dialog: MatDialog,
              public alertService: AlertService) {
  }

  ngAfterViewInit() {
    this.loadRequestDatabase = new LoadRequestDataSource(this._httpClient);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.searchCriteria.valueChanges.subscribe(() => this.paginator.pageIndex = 0);

    // @TODO request gets called twice and causes network error. See why later.
    merge(this.searchCriteria.valueChanges, this.sort.sortChange, this.paginator.page)
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
          this.isLoadingResults = false;

          if (data === null) {
            return [];
          }

          this.resultsLength = data.total_count;
          return data.items;
        }),
      )
      .subscribe(data => (this.data = data));
  }

  onClear() {
    this.searchCriteria.get('filterTerm')?.reset('', {emitEvent: true});
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

  // @TODO get all pages
  download() {
    const blob = new Blob([JSON.stringify(this.data)], { type: 'application/json' });
    saveAs(blob, 'loadRequests-export.json');
    this.alertService.addAlert('', 'Export downloaded.');
  }
}
