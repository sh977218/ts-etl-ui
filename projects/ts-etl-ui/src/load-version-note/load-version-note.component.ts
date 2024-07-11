import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  MatTableModule,
} from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { LoadVersionActivityNote } from '../model/load-version';
import { MatButton } from '@angular/material/button';

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
  @Input() versionQaNotes: LoadVersionActivityNote[] = [];
  notesColumns: string[] = ['tags', 'notes', 'createdBy', 'createdTime', 'action'];
}
