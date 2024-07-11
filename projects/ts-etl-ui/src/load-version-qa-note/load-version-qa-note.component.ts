import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  MatTableModule,
} from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { QAActivityNote } from '../model/load-version';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-load-version-qa-note',
  standalone: true,
  imports: [
    MatSortModule,
    MatTableModule,
    MatButton,
  ],
  templateUrl: './load-version-qa-note.component.html',
  styleUrl: './load-version-qa-note.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadVersionQaNoteComponent {
  @Input() versionQaNotes: QAActivityNote[] = [];
  notesColumns: string[] = ['tags', 'notes', 'createdBy', 'createdTime', 'action'];
}
