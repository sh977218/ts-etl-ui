import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { QAActivityNote, LoadVersion, VersionQAActivity } from '../model/load-version';
import { VersionQaAddNoteModalComponent } from '../version-qa-add-note/version-qa-add-note-modal.component';
import { UserService } from '../service/user-service';
import { AlertService } from '../service/alert-service';

@Component({
  selector: 'app-version-qa-add-note',
  standalone: true,
  imports: [
    NgIf,
    MatSortModule,
    MatTableModule,
    MatButtonModule,
  ],
  templateUrl: './version-qa-add-note.html',
})
export class VersionQaAddNoteComponent {
  @Input() versionQA!: LoadVersion;
  @Output() actionOutput = new EventEmitter<VersionQAActivity>();
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
    const versionQA = this.versionQA;
    this.dialog
      .open(VersionQaAddNoteModalComponent, {
        width: '600px',
      })
      .afterClosed()
      .pipe(
        filter(reason => !!reason),
        switchMap((activityNote: QAActivityNote) => {
          activityNote.createdBy = this.username;
          activityNote.createdTime = new Date();
          return this.http.post<LoadVersion>('/api/addActivityNote', {
            requestId: this.versionQA.requestId,
            activityNote,
          });
        }),
      )
      .subscribe({
        next: updatedVersionQa => {
          versionQA.versionQaActivities = updatedVersionQa.versionQaActivities;
          this.alertService.addAlert('', 'Activity added successfully.');
          this.actionOutput.emit();
        }, error: () => this.alertService.addAlert('', 'Activity add failed.'),
      });
  }
}
