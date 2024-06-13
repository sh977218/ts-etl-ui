import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { LoadRequestMessage } from '../model/load-request';

@Component({
  selector: 'app-load-request-message',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormField,
    MatInputModule,
    MatLabel,
  ],
  templateUrl: './load-request-message.component.html',
  styleUrl: './load-request-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadRequestMessageComponent implements OnInit, AfterViewInit {

  @Input() loadRequestMessages: LoadRequestMessage[] = [];

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

  dataSource: MatTableDataSource<LoadRequestMessage> = new MatTableDataSource<LoadRequestMessage>([]);

  constructor(public http: HttpClient) {
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.loadRequestMessages);
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
