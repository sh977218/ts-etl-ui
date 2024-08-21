import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component, CUSTOM_ELEMENTS_SCHEMA, Input, NO_ERRORS_SCHEMA, OnInit, ViewChild,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MatTableDataSource, MatTableModule,
} from '@angular/material/table';

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

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.loadRequestActivities);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
