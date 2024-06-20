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
    this.dataSource.push({key: 'Code System Name:', value: this.versionQA.codeSystemName})
    this.dataSource.push({key: 'Version:', value: this.versionQA.version})
    this.dataSource.push({key: 'Load Number:', value: this.versionQA.loadNumber})
    this.dataSource.push({key: '', value: ''})
    this.dataSource.push({key: 'Status:', value: this.versionQA.versionStatus})
    this.dataSource.push({key: 'TS Available Date:', value: this.versionQA.availableDate})
    this.dataSource.push({key: '', value: ''})
    this.dataSource.push({key: 'Load Time:', value: this.versionQA.loadTime})
    this.dataSource.push({key: 'Duration:', value: this.versionQA.duration})
    this.dataSource.push({key: '# of Messaged:', value: (this.versionQA.notes || []).length})
    this.dataSource.push({key: '', value: ''})
    this.dataSource.push({key: 'Version Number:', value: this.versionQA.versionNumber})
    this.dataSource.push({key: 'Obsolete ID:', value: this.versionQA.obsoleteId})
    this.dataSource.push({key: 'Language:', value: this.versionQA.language})
    this.dataSource.push({key: 'Country:', value: this.versionQA.country})
    this.dataSource.push({key: 'Published Date:', value: this.versionQA.publishedDate})
    this.dataSource.push({key: 'Effective Date:', value: this.versionQA.effectiveDate})
    this.dataSource.push({key: '', value: ''})
    this.dataSource.push({key: 'Request Id:', value: this.versionQA.requestId})
    this.dataSource.push({key: 'Requester:', value: this.versionQA.requester})
    this.dataSource.push({key: 'Request Time:', value: this.versionQA.requestTime})
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
