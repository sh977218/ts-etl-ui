import { Component, computed, EventEmitter, model, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs';

import { LoadVersion, LoadVersionActivity } from '../model/load-version';
import {
  LoadVersionReviewModalComponent,
} from '../load-version-review-modal/load-version-review-modal.component';

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
  loadVersion = model.required<LoadVersion>({ alias: 'loadVersion' });
  requestId = computed(() => this.loadVersion().requestId);
  versionStatus = computed(() => this.loadVersion().versionStatus);
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
          this.actionOutput.emit(loadVersionActivity);
        },
      });
  }


}
