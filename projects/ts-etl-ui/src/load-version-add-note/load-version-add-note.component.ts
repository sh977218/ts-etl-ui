import { ChangeDetectorRef, Component, computed, model } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { LoadVersionActivityNote, LoadVersion } from '../model/load-version';
import { LoadVersionAddNoteModalComponent } from './load-version-add-note-modal.component';
import { UserService } from '../service/user-service';
import { AlertService } from '../service/alert-service';

@Component({
  selector: 'app-load-version-add-note',
  standalone: true,
  imports: [
    NgIf,
    MatSortModule,
    MatTableModule,
    MatButtonModule,
  ],
  templateUrl: './load-version-add-note.html',
})
export class LoadVersionAddNoteComponent {
  loadVersion = model.required<LoadVersion>();
  requestId = computed(() => this.loadVersion().requestId);
  username: string = '';

  constructor(public userService: UserService,
              private dialog: MatDialog,
              private cd: ChangeDetectorRef,
              private http: HttpClient,
              private alertService: AlertService) {
    userService.user$.subscribe(user => {
      this.username = user?.utsUser.username || '';
    });
  }

  openAddNote() {
    this.dialog
      .open(LoadVersionAddNoteModalComponent, {
        width: '600px',
      })
      .afterClosed()
      .pipe(
        filter(reason => !!reason),
        switchMap((activityNote: LoadVersionActivityNote) => {
          activityNote.createdBy = this.username;
          activityNote.createdTime = new Date();
          return this.http.post<LoadVersion>('/api/addActivityNote', {
            requestId: this.requestId(),
            activityNote,
          });
        }),
      )
      .subscribe({
        next: updatedLoadVersion => {
          this.loadVersion.update((loadVersion) => {
            loadVersion.loadVersionActivities = updatedLoadVersion.loadVersionActivities;
            return loadVersion;
          });
          this.alertService.addAlert('', 'Activity added successfully.');
        }, error: () => this.alertService.addAlert('', 'Activity add failed.'),
      });
  }
}
