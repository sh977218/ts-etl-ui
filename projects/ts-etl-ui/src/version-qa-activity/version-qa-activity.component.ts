import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import {
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  VersionQaReviewDataReturn,
  VersionQaReviewModalComponent,
} from '../version-qa-review-modal/version-qa-review-modal.component';
import { EMPTY, map, switchMap, tap } from 'rxjs';
import { VersionQAActivityHistory } from '../model/version-qa';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { LoadRequestActivity } from '../model/load-request-activity';
import { VersionQaNoteComponent } from '../version-qa-note/version-qa-note.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-version-qa-activity',
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinner,
    MatIconModule,
    VersionQaNoteComponent,
  ],
  templateUrl: './version-qa-activity.component.html',
  styleUrl: './version-qa-activity.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionQaActivityComponent {
  @Input() requestId: number | null = null;
  @Input() versionQaActivities: VersionQAActivityHistory[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['sequence', 'action', 'updatedTime', 'nbNotes'];
  expandedActivity: VersionQAActivityHistory | null = null;

  dataSource: MatTableDataSource<LoadRequestActivity> = new MatTableDataSource<LoadRequestActivity>([]);

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
  ) {
  }

  action(action: 'Accept' | 'Reject') {
    this.dialog
      .open(VersionQaReviewModalComponent, {
        width: '600px',
        data: { tag: action },
      })
      .afterClosed()
      .pipe(
        // transform the data return from modal to `VersionQAActivityHistory`
        map((versionQaReviewDataReturn: VersionQaReviewDataReturn | null) => {
          if (versionQaReviewDataReturn) {
            const { action, ...note } = versionQaReviewDataReturn;
            return {
              action,
              updatedTime: new Date(),
              notes: [note],
            } as VersionQAActivityHistory;
          } else {
            // if user click close button, 'versionQaReviewDataReturn' is null/undefined
            return null;
          }
        }),
        switchMap((versionQAActivityHistory: VersionQAActivityHistory | null) => {
          if (versionQAActivityHistory) {
            return this.http.post('/api/qaActivity', {
              requestId: this.requestId,
              qaActivity: versionQAActivityHistory,
            })
              .pipe(
                /**
                 * because this http post doesn't return any data,
                 * but we need to pass the input from switchMap to next pipe,
                 * so we can update the UI without fetch the entire array again
                 */

                map(() => versionQAActivityHistory),
              );
          } else {
            // if user click close button, we pass empty to next
            return EMPTY;
          }
        }),
        tap({
          next: (versionQAActivityHistory) => {
            if (versionQAActivityHistory) {
              // this.data.activityHistory = [...this.data.activityHistory, versionQAActivityHistory];
              // this.qaActivityHistory.update(versionQAActivityHistories => {
              //   versionQAActivityHistories.push(versionQAActivityHistory);
              //   return versionQAActivityHistories;
              // });
              // this.initDataSource();
            }
          },
        }),
      )
      // intentionally make `.subscribe() to be an empty, so using AsyncPipe (`| async`) in the HTML becomes very easy in future
      .subscribe();
  }

}
