import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AsyncPipe, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CreateLoadRequestModalComponent } from '../create-load-request-modal/create-load-request-modal.component';
import { environment } from '../environments/environment';
import { LoadRequestActivityComponent } from '../load-request-activity/load-request-activity.component';
import { LoadRequestMessageComponent } from '../load-request-message/load-request-message.component';
import { LoadVersionReviewModalComponent } from '../load-version-review-modal/load-version-review-modal.component';
import { LoadRequest } from '../model/load-request';
import { LoadRequestDetailResponse, LoadRequestMessage, LoadRequestSummary } from '../model/load-request-detail';
import { User } from '../model/user';
import { AlertService } from '../service/alert-service';
import { EasternTimePipe } from '../service/eastern-time.pipe';
import { UserService } from '../service/user-service';

export interface RowElement {
  label: string;
  key: string;
  value: string | number | Date | LoadRequestMessage[];
}

const LABEL_MAPPING: Record<string, string> = {
  opRequestSeq: 'Request ID:',
  codeSystemName: 'Code System Name:',
  requestSubject: 'Subject:',
  sourceFilePath: 'Source File Path:',
  type: 'Request Type:',
  requestTime: 'Request Time:',
  requester: 'Requester:',
  creationTime: 'Creation Time:',
  requestStatus: 'Request Status:',
  numberOfMessages: '# of Messages:',
  loadRequestMessageList: ' ',
  loadNumber: 'Load Number:',
  loadStatus: 'Load Status:',
  loadStartTime: 'Load Start Time:',
  loadEndTime: 'Load End Time:',
  loadElapsedTime: 'Elapsed Time:',
  notificationEmail: 'Contact Email:',
  requestType: 'Request Type:',
  scheduledDate: 'Scheduled Date:',
  scheduledTime: 'Scheduled Time:',
};

const LABEL_SORT_ARRAY = [
  'requestId',
  'loadElapsedTime',
  'codeSystemName',
  'requestSubject',
  'sourceFilePath',
  'requestType',
  'requestTime',
  'requester',
  'creationTime',
  'requestStatus',
  'numberOfMessages',
  'loadRequestMessageList',
  'loadNumber',
  'loadStatus',
  'loadStartTime',
  'loadEndTime',
];

@Component({
  selector: 'app-load-request-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatDivider,
    LoadVersionReviewModalComponent,
    MatIcon,
    NgIf,
    RouterLink,
    EasternTimePipe,
    LoadRequestActivityComponent,
    LoadRequestMessageComponent,
    NgForOf,
    CdkVirtualScrollViewport,
  ],
  templateUrl: './load-request-detail.component.html',
  styleUrl: './load-request-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadRequestDetailComponent implements OnInit {

  displayedColumns: string[] = ['key', 'value'];
  messageColumns = ['type', 'tag', 'message', 'time'];

  user: User | null | undefined = undefined;

  dataSource: RowElement[] = [];

  constructor(private http: HttpClient,
              private dialog: MatDialog,
              private activatedRoute: ActivatedRoute,
              private alertService: AlertService,
              private userService: UserService,
  ) {
    userService.user$.subscribe(user => this.user = user);
  }

  loadRequest$ = this.activatedRoute.paramMap
    .pipe(
      map((params: Params) => {
        return params['params']['requestId'];
      }),
      switchMap(requestId => {
        return this.http.get<LoadRequestDetailResponse>(`${environment.apiServer}/load-request/${requestId}`)
          .pipe(map(res => res.result.data));
      }),
    );

  ngOnInit() {
    this.loadRequest$.subscribe((lr) => {
      const loadRequestSummary = lr.loadRequestSummary;
      this.dataSource = [...Object.keys(loadRequestSummary), 'loadElapsedTime', 'numberOfMessages']
        .filter(k => !['_id', 'requesterUsername', 'version', 'loadRequestActivities', 'loadRequestMessages', 'availableDate', 'loadComponents'].includes(k))
        .sort((a, b) => LABEL_SORT_ARRAY.indexOf(a) - LABEL_SORT_ARRAY.indexOf(b))
        .reduce<string[]>((acc, key) => {
          acc.push(key);
          if (['creationTime'].includes(key)) {
            acc.push('spacer');
          }
          return acc;
        }, [])
        .map(key => {
          const result: RowElement = {
            /* istanbul ignore next */
            label: LABEL_MAPPING[key] || `something wrong about ${key}`,
            key,
            value: loadRequestSummary[key as keyof LoadRequestSummary],
          };

          if (key === 'spacer') {
            return {
              label: '',
              key: 'spacer',
              value: '',
            };
          }

          if (key === 'numberOfMessages') {
            result.value = lr.loadRequestSummary.loadRequestMessageList.length || 0;
          }

          if (key === 'loadElapsedTime') {
            result.value = new Date(lr.loadRequestSummary.loadEndTime).getTime() - new Date(lr.loadRequestSummary.loadStartTime).getTime();
          }

          return result;
        });
    });
  }

  isTime(key: string) {
    return ['requestTime', 'scheduledDate', 'creationTime', 'loadStartTime', 'loadEndTime'].includes(key);
  }

  openCancelDialog(reqId: number) {
    this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
    })
      .afterClosed()
      .pipe(
        filter((dialogResult: boolean) => dialogResult),
        switchMap(() => this.http.post(`${environment.apiServer}/load-request/cancel/${reqId}`, {})),
      )
      .subscribe({
        next: () => {
          this.alertService.addAlert('info', `Request (ID: ${reqId}) deleted successfully`);
        },
      });
  }

  openEditDialog(loadRequestSummary: LoadRequestSummary) {
    this.dialog.open(CreateLoadRequestModalComponent, {
      width: '700px',
      data: loadRequestSummary,
    })
      .afterClosed()
      .pipe(
        filter(newLoadRequest => !!newLoadRequest),
        switchMap(newLoadRequest => this.http.post<LoadRequest>
        (`${environment.apiServer}/loadRequest/${loadRequestSummary.opRequestSeq}`, newLoadRequest as LoadRequest)),
      )
      .subscribe({
        next: (newLR) => {
          this.alertService.addAlert('info', `Request (ID: ${newLR.opRequestSeq}) edited successfully`);
        },
      });
  }


}
