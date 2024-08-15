import { DatePipe, NgForOf } from '@angular/common';
import { AfterViewInit, Component, computed, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { tap } from 'rxjs';

import { LoadVersion, LoadVersionActivity } from '../model/load-version';

@Component({
  selector: 'app-load-version-note',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatSortModule,
    MatTableModule,
    MatButton,
    ReactiveFormsModule,
    DatePipe,
    NgForOf,
  ],
  templateUrl: './load-version-note.component.html',
  styleUrl: './load-version-note.component.scss',
})
export class LoadVersionNoteComponent implements AfterViewInit {

  loadVersion = input.required<LoadVersion>();

  dataSource = computed(() =>  {
    const dataSource = new MatTableDataSource<LoadVersionActivity>(this.unwoundActivities());
    dataSource.filterPredicate = (data: LoadVersionActivity) => {
      let hashtagMatched = true;
      if (this.searchCriteria.getRawValue().hashtags?.length) {
        hashtagMatched = data.notes[0].hashtags.includes((this.searchCriteria.getRawValue().hashtags || ''));
      }
      let createdByMatch = true;
      if (this.searchCriteria.getRawValue().createdBy?.length) {
        createdByMatch = data.notes[0].createdBy.toLowerCase().includes((this.searchCriteria.getRawValue().createdBy || '').toLowerCase());
      }
      return hashtagMatched && createdByMatch;
    };
    return dataSource;
  })

  unwoundActivities() {
    return (this.loadVersion().loadVersionActivities || []).flatMap(activity =>
      activity.notes.map(note => ({
        ...activity,
        notes: [note]
      }))
    );
  }
  usersList() {
    return new Set(this.unwoundActivities().map(ua => ua.notes[0].createdBy));
  }
  hashtagsList() {
    return new Set(this.loadVersion().loadVersionActivities.flatMap(activity =>
      activity.notes.flatMap(note => note.hashtags)
    ));
  }

  notesColumns: string[] = ['activityId', 'hashtags', 'notes', 'createdBy', 'createdTime'];
  searchRowColumns = this.notesColumns.map(c => `${c}-search`);

  ngAfterViewInit(): void {
    this.searchCriteria.valueChanges.pipe(tap({ next: () => this.applyFilter() })).subscribe();
  }

  searchCriteria = new FormGroup(
    {
      hashtags: new FormControl<string | undefined>(undefined),
      createdBy: new FormControl<string | undefined>(undefined),
    }, { updateOn: 'change' },
  );

  applyFilter() {
    this.dataSource().filter = this.searchCriteria.getRawValue().toString();
  }
}
