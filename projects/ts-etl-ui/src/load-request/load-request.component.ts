import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import {  MatTableModule,} from '@angular/material/table';
import {  MatInputModule } from '@angular/material/input';
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
import { catchError, map, merge, of, startWith, switchMap, tap} from 'rxjs';

import { LoadRequest, LoadRequestsApiResponse } from '../model/load-request';
import { AlertService } from '../alert-service';
import { LoadRequestActivityComponent } from '../load-request-activity/load-request-activity.component';
import { CreateLoadRequestModalComponent } from '../create-load-request-modal/create-load-request-modal.component';

@Component({
  selector: 'app-load-request',
  standalone: true,
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
    LoadRequestActivityComponent
  ],
  templateUrl: './load-request.component.html',
  styleUrl: './load-request.component.scss',
  providers: [],
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

    merge(this.searchCriteria.valueChanges, this.sort.sortChange, this.paginator.page)
      .pipe(
        tap({
          next: () => this.paginator.firstPage(),
        }),
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
}
