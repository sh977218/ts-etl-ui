import { CommonModule, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';

import { triggerExpandTableAnimation } from '../animations';
import { LoadVersionNoteComponent } from '../load-version-note/load-version-note.component';
import { LoadVersionReviewModalComponent } from '../load-version-review-modal/load-version-review-modal.component';
import type { LoadVersion, LoadVersionActivity } from '../model/load-version';
import { EasternTimePipe } from '../service/eastern-time.pipe';

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
    EasternTimePipe,
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
  @Input() loadVersion!: LoadVersion;

  displayedColumns: string[] = ['key', 'value'];
  dataSource: RowElement[] = [];

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {
    this.dataSource.push({ key: 'Code System Name:', value: this.loadVersion.codeSystemName });
    this.dataSource.push({ key: 'Version:', value: this.loadVersion.version });
    this.dataSource.push({ key: 'Load Number:', value: this.loadVersion.loadNumber });
    this.dataSource.push({ key: '', value: '' });
    this.dataSource.push({ key: 'Status:', value: this.loadVersion.versionStatus });
    this.dataSource.push({
      key: 'TS Available Date:',
      value: this.loadVersion.loadVersionActivities[0]?.availableDate,
      type: 'date',
    });
    this.dataSource.push({ key: '', value: '' });
    this.dataSource.push({ key: 'Load Start Time:', value: this.loadVersion.loadStartTime, type: 'date' });
    this.dataSource.push({ key: 'Elapsed Time:', value: this.loadVersion.loadElapsedTime });
    this.dataSource.push({ key: '# of Messaged:', value: (this.loadVersion.notes || []).length });
    this.dataSource.push({ key: '', value: '' });
    this.dataSource.push({ key: 'Version Number:', value: this.loadVersion.versionNumber });
    this.dataSource.push({ key: 'Obsolete ID:', value: this.loadVersion.obsoleteId });
    this.dataSource.push({ key: 'Language:', value: this.loadVersion.language });
    this.dataSource.push({ key: 'Country:', value: this.loadVersion.country });
    this.dataSource.push({ key: 'Published Date:', value: this.loadVersion.publishedDate });
    this.dataSource.push({ key: 'Effective Date:', value: this.loadVersion.effectiveDate });
    this.dataSource.push({ key: '', value: '' });
    this.dataSource.push({ key: 'Request Id:', value: this.loadVersion.requestId });
    this.dataSource.push({ key: 'Requester:', value: this.loadVersion.requester });
    this.dataSource.push({ key: 'Request Time:', value: this.loadVersion.requestTime, type: 'date' });
  }

}
