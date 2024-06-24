import { Component, input, output } from '@angular/core';
import {
  MatTableModule,
} from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { VersionQA } from '../model/version-qa';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import {
  VersionQaReviewModalComponent
} from '../version-qa-review-modal/version-qa-review-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-version-qa-acceptance-actions',
  standalone: true,
  imports: [
    MatSortModule,
    MatTableModule,
    MatButtonModule,
    NgIf,
  ],
  templateUrl: './version-qa-acceptance-actions.component.html',
})
export class VersionQaAcceptanceActionsComponent  {
  versionQA = input.required<VersionQA>();
  actionOutput = output<string>();

  constructor(
    public dialog: MatDialog,
  ) {}

  action(action: 'Accept' | 'Reject') {
    this.dialog
      .open(VersionQaReviewModalComponent, {
        width: '600px',
        data: { tag: action },
      })
      .afterClosed()
      .subscribe(res => {
        this.versionQA().versionQaActivities.push(res);
        this.actionOutput.emit(this.versionQA().requestId);
      });
  }


}
