import { NgForOf, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';

import { triggerExpandTableAnimation } from '../animations';
import { CodeSystemVersionComponent } from '../code-system-version/code-system-version.component';
import { environment } from '../environments/environment';
import { CodeSystem } from '../model/code-system';

@Component({
  selector: 'app-code-system',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [triggerExpandTableAnimation],
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatIconModule, NgIf, MatListModule, NgForOf, CodeSystemVersionComponent],
  templateUrl: './code-system.component.html',
})
export class CodeSystemComponent {

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  columnsToDisplay: string[] = ['codeSystemName', 'title'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];

  expandedElement: CodeSystem | null = null;

  dataSource: MatTableDataSource<CodeSystem> = new MatTableDataSource<CodeSystem>([]);

  constructor(private http: HttpClient,
              private activatedRoute: ActivatedRoute) {

    this.http.get<CodeSystem[]>(`${environment.apiServer}/codeSystems`).pipe(
      tap({
        next: (codeSystems) => {
          this.dataSource = new MatTableDataSource(codeSystems);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
      }),
    ).subscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
