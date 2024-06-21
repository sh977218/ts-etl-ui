import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { catchError, tap, throwError } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { CodeSystem } from '../model/code-system';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgForOf, NgIf } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { CodeSystemVersionComponent } from '../code-system-version/code-system-version.component';
import { triggerExpandTableAnimation } from '../animations';
import { NavigationService } from '../navigation-service';
import { ActivatedRoute } from '@angular/router';

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
              private activatedRoute: ActivatedRoute,
              private navigationService: NavigationService) {
    activatedRoute.title
      .pipe(
        tap({
          next: title => navigationService.tabs.forEach(tab => tab.isActive = tab.label === title),
        }),
      )
      .subscribe();

    this.http.get<CodeSystem[]>('/codeSystems').pipe(
      tap({
        next: (codeSystems) => {
          this.dataSource = new MatTableDataSource(codeSystems);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return [];
        } else {
          return throwError(() => err);
        }
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
