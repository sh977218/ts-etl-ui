import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { LoadVersionActivityNote, LoadVersion, LoadVersionActivity } from '../model/load-version';
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
  @Input() loadVersion!: LoadVersion;
  @Output() actionOutput = new EventEmitter<LoadVersionActivity>();
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
    const _loadVersion = this.loadVersion;
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
            requestId: this.loadVersion.requestId,
            activityNote,
          });
        }),
      )
      .subscribe({
        next: updatedLoadVersion => {
          _loadVersion.loadVersionActivities = updatedLoadVersion.loadVersionActivities;
          this.alertService.addAlert('', 'Activity added successfully.');
          this.actionOutput.emit();
        }, error: () => this.alertService.addAlert('', 'Activity add failed.'),
      });
  }
}
