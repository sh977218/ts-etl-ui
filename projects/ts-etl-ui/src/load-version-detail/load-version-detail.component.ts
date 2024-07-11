import { CommonModule, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';

import { triggerExpandTableAnimation } from '../animations';
import {
  LoadVersionReviewModalComponent,
} from '../load-version-review-modal/load-version-review-modal.component';
import {
  LoadVersionSourceDataFileModalComponent,
} from '../load-version-source-data-file-modal/load-version-source-data-file-modal.component';
import type { LoadVersion, LoadVersionActivity } from '../model/load-version';
import { LoadVersionNoteComponent } from '../load-version-note/load-version-note.component';

export interface RowElement {
  key: string;
  value: string | number | Date | LoadVersionActivity[];
  type?: string;
}

@Component({
  selector: 'app-load-version-detail',
  standalone: true,
  animations: [triggerExpandTableAnimation],
  imports: [
    CommonModule,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    LoadVersionReviewModalComponent,
    LoadVersionNoteComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './load-version-detail.component.html',
})
export class LoadVersionDetailComponent implements OnInit {
  @Input() versionQA!: LoadVersion;

  displayedColumns: string[] = ['key', 'value'];
  dataSource: RowElement[] = [];

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {
    this.dataSource.push({ key: 'Code System Name:', value: this.versionQA.codeSystemName });
    this.dataSource.push({ key: 'Version:', value: this.versionQA.version });
    this.dataSource.push({ key: 'Load Number:', value: this.versionQA.loadNumber });
    this.dataSource.push({ key: '', value: '' });
    this.dataSource.push({ key: 'Status:', value: this.versionQA.versionStatus });
    this.dataSource.push({
      key: 'TS Available Date:',
      value: this.versionQA.loadVersionActivities[0]?.availableDate,
      type: 'date',
    });
    this.dataSource.push({ key: '', value: '' });
    this.dataSource.push({ key: 'Load Time:', value: this.versionQA.loadTime, type: 'date' });
    this.dataSource.push({ key: 'Duration:', value: this.versionQA.duration });
    this.dataSource.push({ key: '# of Messaged:', value: (this.versionQA.notes || []).length });
    this.dataSource.push({ key: '', value: '' });
    this.dataSource.push({ key: 'Version Number:', value: this.versionQA.versionNumber });
    this.dataSource.push({ key: 'Obsolete ID:', value: this.versionQA.obsoleteId });
    this.dataSource.push({ key: 'Language:', value: this.versionQA.language });
    this.dataSource.push({ key: 'Country:', value: this.versionQA.country });
    this.dataSource.push({ key: 'Published Date:', value: this.versionQA.publishedDate });
    this.dataSource.push({ key: 'Effective Date:', value: this.versionQA.effectiveDate });
    this.dataSource.push({ key: '', value: '' });
    this.dataSource.push({ key: 'Request Id:', value: this.versionQA.requestId });
    this.dataSource.push({ key: 'Requester:', value: this.versionQA.requester });
    this.dataSource.push({ key: 'Request Time:', value: this.versionQA.requestTime, type: 'date' });
  }

  openSourceDataFileModal() {
    this.dialog.open(LoadVersionSourceDataFileModalComponent, {
      width: '600px',
      data: this.versionQA.version,
    })
      .afterClosed()
      .subscribe();
  }

}
