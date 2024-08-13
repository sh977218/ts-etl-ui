import { DatePipe, NgForOf } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { LoadVersion } from '../model/load-version';

@Component({
  selector: 'app-load-version-note',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatSortModule,
    MatTableModule,
    MatButton,
    DatePipe,
    NgForOf,
  ],
  templateUrl: './load-version-note.component.html',
  styleUrl: './load-version-note.component.scss',
})
export class LoadVersionNoteComponent {
  loadVersion = input.required<LoadVersion>();

  unwoundActivities() {
    return (this.loadVersion().loadVersionActivities || []).flatMap(activity =>
      activity.notes.map(note => ({
        ...activity,
        notes: note
      }))
    );
  }

  notesColumns: string[] = ['activityId', 'hashtags', 'notes', 'createdBy', 'createdTime'];

}
