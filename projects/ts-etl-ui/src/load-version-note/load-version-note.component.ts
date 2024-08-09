import { Component, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { LoadVersion, LoadVersionActivityNote } from '../model/load-version';

@Component({
  selector: 'app-load-version-note',
  standalone: true,
  imports: [
    MatSortModule,
    MatTableModule,
    MatButton,
  ],
  templateUrl: './load-version-note.component.html',
  styleUrl: './load-version-note.component.scss',
})
export class LoadVersionNoteComponent {
  loadVersion = input.required<LoadVersion>();

  loadVersionActivityNotes() {
    return (this.loadVersion().loadVersionActivities || []).reduce((previousValue: LoadVersionActivityNote[], currentValue) => {
      return previousValue.concat(currentValue.notes);
    }, []);
  }

  notesColumns: string[] = ['tags', 'notes', 'createdBy', 'createdTime', 'action'];

}
