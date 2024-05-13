import {
  AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, Input, NO_ERRORS_SCHEMA, OnInit, ViewChild
} from '@angular/core';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource, MatTableModule
} from '@angular/material/table';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { LoadRequestActivity } from '../model/load-request-activity';

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
  styleUrl: './load-request-activity.component.scss',
  providers: [],
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

  isLoadingResults = true;

  dataSource: MatTableDataSource<LoadRequestActivity> = new MatTableDataSource<LoadRequestActivity>([]);

  constructor(public http: HttpClient) {
  }

  ngOnInit(): void {
    this.http.get<LoadRequestActivity[]>(`/api/loadRequestActivities/${this.requestId}`)
      .subscribe(data => {
        this.isLoadingResults = false;
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      })
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


}
