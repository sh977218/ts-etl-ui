import { NgForOf, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { triggerExpandTableAnimation } from '../animations';
import { CodeSystemCode } from '../model/code-system';

@Component({
  selector: 'app-code-system-code',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [triggerExpandTableAnimation],
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatIconModule, NgIf, MatListModule, NgForOf],
  templateUrl: './code-system-code.component.html',
})
export class CodeSystemCodeComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  @Input() codes: CodeSystemCode[] = [];

  columnsToDisplay: string[] = ['code', 'name', 'status', 'termType', 'isActive'];

  dataSource: MatTableDataSource<CodeSystemCode> = new MatTableDataSource<CodeSystemCode>([]);

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.codes);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    this.dataSource.paginator!.firstPage();
  }
}
