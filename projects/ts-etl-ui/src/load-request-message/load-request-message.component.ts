import { CommonModule, NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, input, NO_ERRORS_SCHEMA, ViewChild,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MatTableDataSource, MatTableModule,
} from '@angular/material/table';

import { LoadRequestMessage } from '../model/load-request-detail';
import { EasternTimePipe } from '../service/eastern-time.pipe';
import { easternTimeMaSortingDataAccessor } from '../utility/mat-date-sort-fn';

@Component({
  selector: 'app-load-request-message',
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
  providers: [EasternTimePipe],
  templateUrl: './load-request-message.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class LoadRequestMessageComponent implements AfterViewInit {
  easternTime = inject(EasternTimePipe);

  loadRequestMessages = input.required<LoadRequestMessage[]>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'type',
    'tag',
    'message',
    'time',
  ];

  dataSource = computed(() => new MatTableDataSource<LoadRequestMessage>(this.loadRequestMessages()));

  ngAfterViewInit() {
    this.dataSource().paginator = this.paginator;
    this.dataSource().sort = this.sort;
    this.dataSource().sortingDataAccessor = easternTimeMaSortingDataAccessor;
  }

}
