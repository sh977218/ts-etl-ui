import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';

import {
  VersionQaReviewModalComponent,
} from '../version-qa-review-modal/version-qa-review-modal.component';
import {
  VersionQaSourceDataFileModalComponent,
} from '../version-qa-source-data-file-modal/version-qa-source-data-file-modal.component';
import type { VersionQA, VersionQAActivityHistory } from '../model/version-qa';
import { triggerExpandTableAnimation } from '../animations';
import { MatIcon } from '@angular/material/icon';

export interface RowElement {
  label: string;
  key: string;
  value: string | number | Date | VersionQAActivityHistory[];
}

@Component({
  selector: 'app-version-qa-detail',
  standalone: true,
  animations: [triggerExpandTableAnimation],
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
  templateUrl: './version-qa-detail.component.html',
})
export class VersionQaDetailComponent implements OnInit {
  @Input() data!: VersionQA;

  displayedColumns: string[] = ['key', 'value'];
  dataSource: RowElement[] = [];
  qaActivityHistory: WritableSignal<VersionQAActivityHistory[]> = signal([]);

  constructor(
    public dialog: MatDialog,
  ) {
  }

  initDataSource() {
    this.dataSource = Object.keys(this.data)
      .filter(k => !['activityHistory'].includes(k)) // do not show 'activityHistory'//
      .map(key => ({
        label: key.toUpperCase(),
        key: key,
        value: this.data[key as keyof VersionQA],
      }));
    this.qaActivityHistory.set(this.data.activityHistory);
  }

  ngOnInit() {
    this.initDataSource();
  }

  openSourceDataFileModal() {
    this.dialog.open(VersionQaSourceDataFileModalComponent, {
      width: '600px',
      data: this.data.version,
    })
      .afterClosed()
      .subscribe();
  }

}
