import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, input, ViewChild } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { LoadComponentMessage } from '../model/load-request-detail';
import { EasternTimePipe } from '../service/eastern-time.pipe';
import { easternTimeMaSortingDataAccessor } from '../utility/mat-date-sort-fn';

@Component({
  selector: 'app-load-component-message',
  standalone: true,
  imports: [
    CommonModule,
    EasternTimePipe,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormField,
    MatInputModule,
    MatLabel,
  ],
  providers: [EasternTimePipe],
  templateUrl: './load-component-message.component.html',
  styleUrl: './load-component-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadComponentMessageComponent implements AfterViewInit {
  easternTime = inject(EasternTimePipe);

  loadComponentMessages = input.required<LoadComponentMessage[]>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'componentName',
    'messageGroup',
    'messageType',
    'tag',
    'message',
    'creationTime',
  ];

  dataSource = computed(() => new MatTableDataSource<LoadComponentMessage>(this.loadComponentMessages()));

  ngAfterViewInit() {
    this.dataSource().paginator = this.paginator;
    this.dataSource().sort = this.sort;
    this.dataSource().sortingDataAccessor = easternTimeMaSortingDataAccessor;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource().filter = filterValue.trim().toLowerCase();
    this.dataSource().paginator!.firstPage();
  }

}
