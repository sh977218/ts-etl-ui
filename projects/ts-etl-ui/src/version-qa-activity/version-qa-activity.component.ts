import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { EMPTY, map, switchMap, tap } from 'rxjs';

import {
  VersionQaReviewDataReturn,
  VersionQaReviewModalComponent,
} from '../version-qa-review-modal/version-qa-review-modal.component';
import { VersionQAActivity } from '../model/version-qa';
import { VersionQaNoteComponent } from '../version-qa-note/version-qa-note.component';
import { triggerExpandTableAnimation } from '../animations';

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
  ],
  templateUrl: './version-qa-activity.component.html',
  styleUrl: './version-qa-activity.component.scss',
  animations: [triggerExpandTableAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionQaActivityComponent implements OnInit, AfterViewInit {
  @Input() requestId: number | null = null;
  @Input() versionQaActivities: VersionQAActivity[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['sequence', 'action', 'updatedTime', 'nbNotes'];
  expandedActivity: VersionQAActivity | null = null;

  dataSource: MatTableDataSource<VersionQAActivity> = new MatTableDataSource<VersionQAActivity>([]);

//  qaActivityHistory: WritableSignal<VersionQAActivityHistory[]> = signal([]);

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
  ) {
  }

  ngOnInit() {
    //  this.qaActivityHistory.set(this.versionQaActivities);
    this.dataSource = new MatTableDataSource(this.versionQaActivities);
  }

  ngAfterViewInit(): void {
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
            } as VersionQAActivity;
          } else {
            // if user click close button, 'versionQaReviewDataReturn' is null/undefined
            return null;
          }
        }),
        switchMap((versionQAActivities: VersionQAActivity | null) => {
          if (versionQAActivities) {
            return this.http.post('/api/qaActivity', {
              requestId: this.requestId,
              qaActivity: versionQAActivities,
            })
              .pipe(
                /**
                 * because this http post doesn't return any data,
                 * but we need to pass the input from switchMap to next pipe,
                 * so we can update the UI without fetch the entire array again
                 */

                map(() => versionQAActivities),
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
