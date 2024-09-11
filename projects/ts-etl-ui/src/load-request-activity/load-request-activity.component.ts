import { CommonModule, NgIf } from '@angular/common';
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

import { LoadComponent, LoadVersion } from '../model/load-version';
import { EasternTimePipe } from '../service/eastern-time.pipe';

@Component({
  selector: 'app-load-request-activity',
  standalone: true,
  imports: [
    CommonModule,
    EasternTimePipe,
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
  @Input() loadVersion: LoadVersion;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'componentName',
    'startTime',
    'endTime',
    'duration',
    'status',
    'nbOfMessages',
  ];

  dataSource: MatTableDataSource<LoadComponent> = new MatTableDataSource<LoadComponent>([]);

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.loadVersion.loadSummary.components);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  duration(row: LoadComponent) {
    const startDate = new Date(row.startTime);
    const endDate = new Date(row.endTime);
    return endDate.getTime() - startDate.getTime();
  }

}
