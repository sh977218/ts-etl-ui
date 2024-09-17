import { AsyncPipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { filter, finalize, map, switchMap, tap } from 'rxjs';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CreateLoadRequestModalComponent } from '../create-load-request-modal/create-load-request-modal.component';
import { environment } from '../environments/environment';
import { LoadRequestActivityComponent } from '../load-request-activity/load-request-activity.component';
import { LoadRequestMessageComponent } from '../load-request-message/load-request-message.component';
import {
  LoadVersionReviewModalComponent,
} from '../load-version-review-modal/load-version-review-modal.component';
import { LoadRequest, LoadRequestMessage } from '../model/load-request';
import { LoadVersion, LoadVersionActivity } from '../model/load-version';
import { User } from '../model/user';
import { AlertService } from '../service/alert-service';
import { EasternTimePipe } from '../service/eastern-time.pipe';
import { LoadingService } from '../service/loading-service';
import { UserService } from '../service/user-service';

export interface RowElement {
  label: string;
  key: string;
  value: string | number | Date | LoadVersionActivity[] | LoadRequestMessage[];
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
  loadNumber: 'Load Number:',
  loadStatus: 'Load Status:',
  loadStartTime: 'Load Start Time:',
  loadElapsedTime: 'Elapsed Time:',
  notificationEmail: 'Contact Email:',
  requestType: 'Request Type:',
  scheduledDate: 'Scheduled Date:',
  scheduledTime: 'Scheduled Time:',
};

const LABEL_SORT_ARRAY = [
  'requestId',
  'codeSystemName',
  'requestSubject',
  'sourceFilePath',
  'requestType',
  'requestTime',
  'requester',
  'creationTime',
  'requestStatus',
  'numberOfMessages',
  'loadNumber',
  'loadStatus',
  'loadStartTime',
  'loadElapsedTime',
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
  ],
  templateUrl: './load-request-detail.component.html',
  styleUrl: './load-request-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadRequestDetailComponent implements OnInit {

  displayedColumns: string[] = ['key', 'value'];

  user: User | null | undefined = undefined;

  dataSource: RowElement[] = [];

  constructor(private http: HttpClient,
              private dialog: MatDialog,
              private activatedRoute: ActivatedRoute,
              private alertService: AlertService,
              private userService: UserService,
              private loadingService: LoadingService,
  ) {
    userService.user$.subscribe(user => this.user = user);
  }

  loadRequest$ = this.activatedRoute.paramMap
    .pipe(
      tap({ next: () => this.loadingService.showLoading() }),
      map((params: Params) => {
        return params['params']['requestId'];
      }),
      switchMap(requestId => {
        return this.http.get<LoadRequest>(`${environment.apiServer}/loadRequest/${requestId}`)
          .pipe(
            finalize(() => this.loadingService.hideLoading()),
          )
      }),
    );

  loadVersion$ = this.activatedRoute.paramMap
    .pipe(
      map((params: Params) => {
        return params['params']['requestId'];
      }),
      switchMap(requestId => {
        return this.http.get<LoadVersion>(`${environment.apiServer}/loadVersion/${requestId}`)
      }),
    );

  ngOnInit() {
    this.loadRequest$.subscribe(lr => {
      this.dataSource = Object.keys(lr)
        .filter(k => !['_id', 'version', 'loadRequestActivities', 'loadRequestMessages', 'availableDate', 'loadEndTime', 'loadComponents'].includes(k))
        .sort((a, b) => LABEL_SORT_ARRAY.indexOf(a) - LABEL_SORT_ARRAY.indexOf(b))
        .reduce<string[]>((acc, key) => {
          acc.push(key);
          if (['creationTime', 'numberOfMessages'].includes(key)) {
            acc.push('spacer');
          }
          return acc;
        }, [])
        .map(key => {
          if(key === 'spacer') {
            return {
              label: '',
              key: 'spacer',
              value: '',
            }
          }
          return {
            /* istanbul ignore next */
            label: LABEL_MAPPING[key] || `something wrong about ${key}`,
            key: key,
            value: lr[key as keyof LoadRequest],
          };
        });
    })
  }

  isTime(key: string) {
    return ['requestTime', 'scheduledDate', 'creationTime', 'loadStartTime'].includes(key);
  }

  openCancelDialog(reqId: number) {
    this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
    })
      .afterClosed()
      .pipe(
        filter((dialogResult: boolean) => dialogResult),
        switchMap(() => this.http.post(`${environment.newApiServer}/loadRequest/${reqId}`, {})),
      )
      .subscribe({
        next: () => {
          this.alertService.addAlert('info', `Request (ID: ${reqId}) deleted successfully`);
        },
      });
  }

  openEditDialog(loadRequest: LoadRequest) {
    this.dialog.open(CreateLoadRequestModalComponent, {
      width: '700px',
      data: loadRequest,
    })
      .afterClosed()
      .pipe(
        filter(newLoadRequest => !!newLoadRequest),
        switchMap(newLoadRequest => this.http.post<LoadRequest>
        (`${environment.apiServer}/loadRequest/${loadRequest.opRequestSeq}`, newLoadRequest as LoadRequest)),
      )
      .subscribe({
        next: (newLR) => {
          this.alertService.addAlert('info', `Request (ID: ${newLR.opRequestSeq}) edited successfully`);
        },
      });
  }


}
