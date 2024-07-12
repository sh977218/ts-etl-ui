import { Component, computed, model } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';

import {
  LoadVersionReviewModalComponent,
} from '../load-version-review-modal/load-version-review-modal.component';
import { LoadVersion } from '../model/load-version';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AlertService } from '../service/alert-service';

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

  constructor(private http: HttpClient,
              private dialog: MatDialog,
              private alertService: AlertService) {
  }

  action(action: 'Accept' | 'Reject' | 'Reset') {
    this.dialog
      .open(LoadVersionReviewModalComponent, {
        width: '600px',
        data: { tag: action },
      })
      .afterClosed()
      .pipe(
        filter(reason => !!reason),
        switchMap((newLoadVersionActivity) => {
          return this.http.post(`${environment.apiServer}/loadVersionActivity`, {
            requestId: this.requestId(),
            loadVersionActivity: newLoadVersionActivity,
          })
            .pipe(
              switchMap(() => this.http.get<LoadVersion>(`${environment.apiServer}/loadVersion/${this.requestId()}`)),
            );
        }),
      )
      .subscribe({
        next: (updatedLoadVersion) => {
          this.loadVersion.update((loadVersion) => {
            loadVersion.loadVersionActivities = updatedLoadVersion.loadVersionActivities;
            loadVersion.versionStatus = updatedLoadVersion.versionStatus;
            return loadVersion;
          });
          this.alertService.addAlert('', 'Activity added successfully.');
        }, error: () => this.alertService.addAlert('', 'Activity add failed.'),
      });
  }


}
