import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { triggerExpandTableAnimation } from '../animations';
import { VersionQaReviewModalComponent } from '../version-qa-review-modal/version-qa-review-modal.component';
import {
  VersionQaSourceDataFileModalComponent,
} from '../version-qa-source-data-file-modal/version-qa-source-data-file-modal.component';
import type { VersionQA, VersionQAActivity } from '../model/version-qa';
import { VersionQaNoteComponent } from '../version-qa-note/version-qa-note.component';

export interface RowElement {
  label: string;
  key: string;
  value: string | number | Date | VersionQAActivity[];
}

@Component({
  selector: 'app-version-qa-detail',
  standalone: true,
  animations: [triggerExpandTableAnimation],
  imports: [
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    VersionQaReviewModalComponent,
    VersionQaNoteComponent,
  ],
  templateUrl: './version-qa-detail.component.html',
})
export class VersionQaDetailComponent implements OnInit {
  @Input() versionQA!: VersionQA;

  displayedColumns: string[] = ['key', 'value'];
  dataSource: RowElement[] = [];

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {
    this.dataSource = Object.keys(this.versionQA)
      .filter(k => !['_id', 'activityHistory'].includes(k)) // do not show 'activityHistory'//
      .map(key => ({
        label: key.toUpperCase(),
        key: key,
        value: this.versionQA[key as keyof VersionQA],
      }));
  }

  openSourceDataFileModal() {
    this.dialog.open(VersionQaSourceDataFileModalComponent, {
      width: '600px',
      data: this.versionQA.version,
    })
      .afterClosed()
      .subscribe();
  }

}
