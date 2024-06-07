import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { NgForOf, NgIf } from "@angular/common";
import { MatListModule } from "@angular/material/list";

import { CodeSystemVersion } from "../model/code-system";
import { CodeSystemCodeComponent } from "../code-system-code/code-system-code.component";
import { triggerExpandTableAnimation } from "../animations";

@Component({
    selector: 'app-code-system-version',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [triggerExpandTableAnimation],
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatIconModule, NgIf, MatListModule, NgForOf, CodeSystemCodeComponent],
    templateUrl: './code-system-version.component.html',
})
export class CodeSystemVersionComponent implements OnInit {

    @ViewChild(MatPaginator, {static: false}) paginator!: MatPaginator;
    @ViewChild(MatSort, {static: false}) sort!: MatSort;

    @Input() versions: CodeSystemVersion[] = []

    columnsToDisplay: string[] = ["versionName", "status", "publishedDate", "effectiveDate", "availableDate"];
    columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];

    expandedElement: CodeSystemVersion | null = null;

    dataSource: MatTableDataSource<CodeSystemVersion> = new MatTableDataSource<CodeSystemVersion>([]);

    ngOnInit() {
        this.dataSource = new MatTableDataSource(this.versions);
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
