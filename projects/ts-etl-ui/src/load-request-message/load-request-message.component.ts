import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, input, ViewChild } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { LoadRequestActivity } from '../model/load-request';

type MessageUI = {
  componentName: string;
  messageGroup: string;
  messageType: string;
  tag: string;
  message: string;
  creationTime: Date;
}

@Component({
  selector: 'app-load-request-message',
  standalone: true,
  providers: [DatePipe],
  imports: [
    CommonModule,
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
export class LoadRequestMessageComponent implements AfterViewInit {

  loadRequestActivities = input<LoadRequestActivity[]>([]);

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

  dataSource = computed(() => {
    const messages: MessageUI[] = [];
    this.loadRequestActivities().forEach(m => {
      m.infos.forEach(i => {
        messages.push({
          componentName: m.componentName,
          messageGroup: 'Info',
          messageType: i.messageType,
          message: i.message,
          tag: i.tag,
          creationTime: i.creationTime,
        });
      });
      m.warnings.forEach(i => {
        messages.push({
          componentName: m.componentName,
          messageGroup: 'Warning',
          messageType: i.messageType,
          message: i.message,
          tag: i.tag,
          creationTime: i.creationTime,
        });
      });
      m.errors.forEach(i => {
        messages.push({
          componentName: m.componentName,
          messageGroup: 'Error',
          messageType: i.messageType,
          message: i.message,
          tag: i.tag,
          creationTime: i.creationTime,
        });
      });
    });

    const datasource = new MatTableDataSource<MessageUI>(messages);
    return datasource;
  });

  ngAfterViewInit() {
    this.dataSource().paginator = this.paginator;
    this.dataSource().sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource().filter = filterValue.trim().toLowerCase();

    if (this.dataSource().paginator) {
      this.dataSource().paginator!.firstPage();
    }
  }


}
