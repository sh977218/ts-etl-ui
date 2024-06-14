import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { LoadRequest, LoadRequestMessage } from '../model/load-request';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { VersionQaReviewModalComponent } from '../version-qa-review-modal/version-qa-review-modal.component';
import { MatIcon } from '@angular/material/icon';

export interface RowElement {
  label: string;
  key: string;
  value: string | number | Date | LoadRequestMessage[];
}

const LABEL_MAPPING: Record<string, string> = {
  requestId: 'Request ID',
  codeSystemName: 'Code System Number',
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
  loadTime: 'Load Time',
  duration: 'Duration',
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
  'loadTime',
  'duration',
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
    VersionQaReviewModalComponent,
    MatIcon,
    NgIf,
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
      .filter(k => !['_id', 'version', 'loadRequestMessages', 'availableDate'].includes(k))
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
