import { NgIf } from '@angular/common';
import { Component, computed, EventEmitter, input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { filter } from 'rxjs';

import {
  LoadVersionReviewModalComponent,
} from '../load-version-review-modal/load-version-review-modal.component';
import { LoadVersion, LoadVersionActivity } from '../model/load-version';

@Component({
  selector: 'app-load-version-acceptance-actions',
  standalone: true,
  imports: [
    NgIf,
    MatSortModule,
    MatTableModule,
    MatButtonModule,
  ],
  templateUrl: './load-version-acceptance-actions.component.html',
})
export class LoadVersionAcceptanceActionsComponent {
  loadVersion = input.required<LoadVersion>();
  requestId = computed(() => this.loadVersion().requestId);
  @Output() actionOutput = new EventEmitter<LoadVersionActivity>();

  constructor(private dialog: MatDialog) {
  }

  action(action: 'Accept' | 'Reject' | 'Reset') {
    this.dialog
      .open(LoadVersionReviewModalComponent, {
        width: '600px',
        data: { tag: action },
      })
      .afterClosed()
      .pipe(filter(reason => !!reason))
      .subscribe({
        next: (loadVersionActivity: LoadVersionActivity) => {
          loadVersionActivity.activity = action;
          this.actionOutput.emit(loadVersionActivity);
        },
      });
  }


}
