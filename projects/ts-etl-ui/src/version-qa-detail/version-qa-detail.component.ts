import {NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common'
import {Component, Input, OnInit} from '@angular/core'
import {MatButtonModule} from "@angular/material/button"
import {MatTableModule} from '@angular/material/table'
import {MatDialog, MatDialogModule} from "@angular/material/dialog"
import {MatCardModule} from "@angular/material/card";

import type {VersionQA, VersionQAActivityHistory} from '../model/version-qa'
import {MatDivider} from "@angular/material/divider";
import {VersionQaReviewModalComponent} from '../version-qa-review-modal/version-qa-review-modal.component';
import {
  VersionQaSourceDataFileModalComponent
} from '../version-qa-source-data-file-modal/version-qa-source-data-file-modal.component'

export interface RowElement {
  label: string;
  key: string;
  value: string | number | Date | VersionQAActivityHistory[];
}

@Component({
  selector: 'app-version-qa-detail',
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
    VersionQaReviewModalComponent
  ],
  templateUrl: './version-qa-detail.component.html'
})
export class VersionQaDetailComponent implements OnInit {
  displayedColumns: string[] = ["key", "value"];
  qaActivityColumns: string[] = ['sequence', 'action', 'updatedTime', 'nbNotes'];
  dataSource: RowElement[] = [];
  qaActivityHistory!: VersionQAActivityHistory[];
  @Input() data!: VersionQA;


  constructor(
    public dialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.dataSource = Object.keys(this.data).map(key => ({
      label: key.toUpperCase(),
      key: key,
      value: this.data[key as keyof VersionQA]
    }));
    this.qaActivityHistory = this.data.activityHistory;
  }

  accept() {
    const dialogRef = this.dialog.open(VersionQaReviewModalComponent, {
      width: '600px',
      data: {tag: 'Accept'}
    })
    dialogRef.afterClosed().subscribe(result => {
      this.data.activityHistory.push({
        action: 'Accept', updatedTime: new Date(),
        notes: [{tag: 'Accept', createdBy: result.createdBy, notes: result.notes, availableDate: result.availableDate}]
      })
    });
  }

  openSourceDataFileModal() {
    this.dialog.open(VersionQaSourceDataFileModalComponent, {
      width: '600px',
      data: this.data.version
    })
      .afterClosed()
      .subscribe();
  }

}
