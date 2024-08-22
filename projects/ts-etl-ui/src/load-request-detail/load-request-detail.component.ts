import { DatePipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

import {
  LoadVersionReviewModalComponent,
} from '../load-version-review-modal/load-version-review-modal.component';
import { LoadRequest, LoadRequestActivity, LoadRequestMessage } from '../model/load-request';

export interface RowElement {
  label: string;
  key: string;
  value: string | number | Date | LoadRequestActivity[] | LoadRequestMessage[];
}

const LABEL_MAPPING: Record<string, string> = {
  opRequestSeq: 'Request ID',
  codeSystemName: 'Code System Name',
  requestSubject: 'Subject',
  sourceFilePath: 'Source File Path',
  type: 'Request Type',
  requestTime: 'Request Time',
  requester: 'Requester',
  creationTime: 'Creation Time',
  requestStatus: 'Request Status',
  numberOfMessages: '# of Messages',
  loadNumber: 'Load Number',
  loadStatus: 'Load Status',
  loadStartTime: 'Load Start Time',
  loadElapsedTime: 'Elapsed Time',
  notificationEmail: 'Contact Email',
  requestType: 'Request Type',
};

const LABEL_SORT_ARRAY = [
  'requestId',
  'codeSystemName',
  'requestSubject',
  'sourceFilePath',
  'type',
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
    DatePipe,
  ],
  templateUrl: './load-request-detail.component.html',
  styleUrl: './load-request-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadRequestDetailComponent implements OnInit {
  @Input() loadRequest!: LoadRequest;

  displayedColumns: string[] = ['key', 'value'];

  dataSource: RowElement[] = [];

  constructor() {
  }

  ngOnInit() {
    this.dataSource = Object.keys(this.loadRequest)
      .filter(k => !['_id', 'version', 'loadRequestActivities', 'loadRequestMessages', 'availableDate', 'loadEndTime'].includes(k))
      .sort((a, b) => LABEL_SORT_ARRAY.indexOf(a) - LABEL_SORT_ARRAY.indexOf(b))
      .map(key => {
        return {
          label: LABEL_MAPPING[key] || `something wrong about ${key}`,
          key: key,
          value: this.loadRequest[key as keyof LoadRequest],
        };
      });
  }
}
