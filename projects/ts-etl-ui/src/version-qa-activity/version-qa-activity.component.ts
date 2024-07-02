import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';

import { VersionQAActivity } from '../model/version-qa';
import { VersionQaNoteComponent } from '../version-qa-note/version-qa-note.component';
import { triggerExpandTableAnimation } from '../animations';
import { NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { map, of, tap } from 'rxjs';
import { AlertService } from '../service/alert-service';
import { saveAs } from 'file-saver';
import { DownloadService } from '../service/download-service';

@Component({
  selector: 'app-version-qa-activity',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    VersionQaNoteComponent,
    NgIf,
    MatIcon,
  ],
  templateUrl: './version-qa-activity.component.html',
  styleUrl: './version-qa-activity.component.scss',
  animations: [triggerExpandTableAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionQaActivityComponent implements AfterViewInit {
  requestId = input.required<number>();
  versionQaActivities = input.required<VersionQAActivity[]>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'activity', 'availableDate', 'reason', 'nbNotes'];
  expandedElement: VersionQAActivity | null = null;

  dataSource = computed(() => {
    return new MatTableDataSource<VersionQAActivity>(this.versionQaActivities().reverse());
  });

  constructor(private alertService: AlertService,
              private downloadService: DownloadService) {
  }

  ngAfterViewInit(): void {
    this.dataSource().paginator = this.paginator;
    this.dataSource().sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource().filter = filterValue.trim().toLowerCase();

    if (this.dataSource().paginator) {
      this.dataSource().paginator?.firstPage();
    }
  }

  downloadQaActivities() {
    of(this.versionQaActivities())
      .pipe(
        map(data => {
          const headerList = [...this.displayedColumns];
          data.forEach(item=>item.nbNotes = item.notes.length)
          return this.downloadService.generateBlob(headerList, data);
        }),
        tap({
          next: (blob) => {
            saveAs(blob, 'versionQaActivity-export.csv');
            this.alertService.addAlert('', 'QA Activities downloaded.');
          },
          error: () => this.alertService.addAlert('', 'QA Activities download failed.'),
        }),
      )
      .subscribe();
  }

}
