import {
  Component, CUSTOM_ELEMENTS_SCHEMA, Input, NO_ERRORS_SCHEMA, OnInit, ViewChild
} from '@angular/core';
import {NgIf} from '@angular/common';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  MatTableDataSource, MatTableModule
} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';

import {LoadRequestActivity} from '../model/load-request-activity';
import {catchError, throwError} from 'rxjs';
import {LoadingService} from "../loading-service";
import {AlertService} from "../alert-service";

@Component({
  selector: 'app-load-request-activity',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    NgIf,
    MatProgressSpinner
  ],
  templateUrl: './load-request-activity.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class LoadRequestActivityComponent implements OnInit {
  @Input() requestId: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'componentName',
    'startTime',
    'endTime',
    'duration',
    'status',
    'messageType',
    'message',
    'creationTime'
  ];

  dataSource: MatTableDataSource<LoadRequestActivity> = new MatTableDataSource<LoadRequestActivity>([]);

  constructor(public http: HttpClient,
              private loadingService: LoadingService,
              private alertService: AlertService) {
  }

  ngOnInit(): void {
    this.loadingService.showLoading();
    this.http.get<LoadRequestActivity[]>(`/api/loadRequestActivities/${this.requestId}`)
      .pipe(catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return [];
        } else {
          return throwError(() => err)
        }
      }))
      .subscribe({
        next: data => {
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        error: () => this.alertService.addAlert('success', 'Error loading.')
      })
      .add(() => this.loadingService.hideLoading())
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


}
