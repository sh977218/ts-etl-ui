import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs';

import {
  LoadVersionQaReviewModalComponent,
} from '../load-version-qa-review-modal/load-version-qa-review-modal.component';
import { LoadVersion, VersionQAActivity } from '../model/load-version';

@Component({
  selector: 'app-load-version-acceptance-actions',
  standalone: true,
  imports: [
    NgIf,
    MatSortModule,
    MatTableModule,
    MatButtonModule,
  ],
  templateUrl: './load-version-qa-acceptance-actions.component.html',
})
export class LoadVersionQaAcceptanceActionsComponent {
  @Input() versionQA!: LoadVersion;
  @Output() actionOutput = new EventEmitter<VersionQAActivity>();

  constructor(private dialog: MatDialog) {
  }

  action(action: 'Accept' | 'Reject') {
    this.dialog
      .open(LoadVersionQaReviewModalComponent, {
        width: '600px',
        data: { tag: action },
      })
      .afterClosed()
      .pipe(
        filter(reason => !!reason),
      )
      .subscribe((versionQAActivity: VersionQAActivity) => {
        this.actionOutput.emit(versionQAActivity);
      });
  }


}
