import { CommonModule, NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component, computed, CUSTOM_ELEMENTS_SCHEMA, input, NO_ERRORS_SCHEMA, ViewChild,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MatTableDataSource, MatTableModule,
} from '@angular/material/table';

import { LoadComponent } from '../model/load-request-detail';
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
export class LoadRequestActivityComponent implements AfterViewInit {
  componentActivities = input.required<LoadComponent[]>();

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

  dataSource = computed(() => new MatTableDataSource<LoadComponent>(this.componentActivities()));

  ngAfterViewInit() {
    this.dataSource().paginator = this.paginator;
    this.dataSource().sort = this.sort;
  }

  duration(row: LoadComponent) {
    const startDate = new Date(row.componentStartTime);
    const endDate = new Date(row.componentEndTime);
    return endDate.getTime() - startDate.getTime();
  }

}
