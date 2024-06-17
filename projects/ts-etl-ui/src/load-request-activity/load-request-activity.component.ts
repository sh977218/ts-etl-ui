import {
  AfterViewInit,
  Component, CUSTOM_ELEMENTS_SCHEMA, Input, NO_ERRORS_SCHEMA, OnInit, ViewChild,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatTableDataSource, MatTableModule,
} from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { LoadRequestActivity } from '../model/load-request';

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
    MatProgressSpinner,
  ],
  templateUrl: './load-request-activity.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class LoadRequestActivityComponent implements OnInit, AfterViewInit {
  @Input() loadRequestActivities: LoadRequestActivity[] = [];
  @Input() requestId: number | null = null;

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
    'creationTime',
  ];

  dataSource: MatTableDataSource<LoadRequestActivity> = new MatTableDataSource<LoadRequestActivity>([]);

  constructor(public http: HttpClient) {
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.loadRequestActivities);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
