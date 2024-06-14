import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  MatTableModule,
} from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { QAActivityNote } from '../model/version-qa';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-version-qa-note',
  standalone: true,
  imports: [
    MatSortModule,
    MatTableModule,
    MatButton,
  ],
  templateUrl: './version-qa-note.component.html',
  styleUrl: './version-qa-note.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionQaNoteComponent {
  @Input() versionQaNotes: QAActivityNote[] = [];
  notesColumns: string[] = ['tags', 'notes', 'createdBy', 'createdTime', 'action'];
}
