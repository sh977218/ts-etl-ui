import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { LoadingService } from "../loading-service";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { catchError, tap, throwError } from "rxjs";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";

import { CodeSystem } from "../model/code-system";

@Component({
    selector: 'app-code-system',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule],
    templateUrl: './code-system.component.html',
})
export class CodeSystemComponent {

    @ViewChild(MatPaginator, {static: false}) paginator!: MatPaginator;
    @ViewChild(MatSort, {static: false}) sort!: MatSort;

    displayedColumns: string[] = ['codeSystemName', 'title'];

    dataSource: MatTableDataSource<CodeSystem> = new MatTableDataSource<CodeSystem>([]);

    constructor(private http: HttpClient,
                public dialog: MatDialog,
                private loadingService: LoadingService) {
        this.http.get<CodeSystem[]>('/api/codeSystems').pipe(
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
                    return throwError(() => err)
                }
            })
        ).subscribe()
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
}
