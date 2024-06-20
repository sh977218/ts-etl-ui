import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, Component, ViewChild } from '@angular/core';
import { CommonModule, JsonPipe, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { merge, startWith, switchMap, catchError, of, map } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { VersionQA, VersionQAsApiResponse } from '../model/version-qa';
import { VersionQaDataSource } from './version-qa-data-source';
import { LoadingService } from '../loading-service';
import { VersionQaDetailComponent } from '../version-qa-detail/version-qa-detail.component';
import { triggerExpandTableAnimation } from '../animations';
import { VersionQaActivityComponent } from '../version-qa-activity/version-qa-activity.component';

@Component({
  selector: 'app-version-qa',
  standalone: true,
  imports: [NgIf,
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
    VersionQaDetailComponent, VersionQaActivityComponent, JsonPipe,
  ],
  templateUrl: './version-qa.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  animations: [triggerExpandTableAnimation],
})
export class VersionQaComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'codeSystemName',
    'version',
    'loadNumber',
    'versionStatus',
    'loadTime',
    'requestId',
    'requester',
    'requestTime',
  ];

  versionQaDatabase: VersionQaDataSource | null = null;
  data: VersionQA[] = [];

  resultsLength = 0;
  expandedElement: VersionQA | null = null;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(private http: HttpClient,
              public dialog: MatDialog,
              private loadingService: LoadingService) {
  }

  ngAfterViewInit() {
    this.versionQaDatabase = new VersionQaDataSource(this.http);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.loadingService.showLoading();
          return this.versionQaDatabase!.getVersionQAs(
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
          ).pipe(catchError(() => of(null)));
        }),
        map((data: VersionQAsApiResponse | null) => {
          if (data === null) {
            return [];
          }

          this.resultsLength = data.total_count;
          return data.items;
        }),
      )
      .subscribe(data => {
        this.loadingService.hideLoading();
        this.data = data;
      });
  }

}
