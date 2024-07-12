import { ChangeDetectionStrategy, Component, computed, effect, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButton } from '@angular/material/button';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadVersionNoteComponent {
  loadVersion = input<LoadVersion>();

  loadVersionNotes = computed(() => {
    return (this.loadVersion()?.loadVersionActivities || []).reduce((previousValue: LoadVersionActivityNote[], currentValue) => {
      return previousValue.concat(currentValue.notes);
    }, []);
  });
  notesColumns: string[] = ['tags', 'notes', 'createdBy', 'createdTime', 'action'];

  constructor() {
    effect(() => {
      console.log(`The loadVersion is: ${this.loadVersion()})`);
      console.log(`The loadVersionNotes is: ${this.loadVersionNotes()})`);
    });
  }
}
