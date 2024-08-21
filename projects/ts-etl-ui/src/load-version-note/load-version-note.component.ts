import { DatePipe, JsonPipe, NgForOf } from '@angular/common';
import { AfterViewInit, Component, computed, effect, input, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { tap } from 'rxjs';

import { LoadVersionActivity } from '../model/load-version';

type ActivityNoteSortable = {
  activityId: Date;
  createdTime: Date;
  createdBy: string;
  note: string;
  hashtags: string[];
}

@Component({
  selector: 'app-load-version-note',
  standalone: true,
  providers: [provideNativeDateAdapter(), DatePipe],
  imports: [
    MatSortModule,
    MatTableModule,
    MatButton,
    ReactiveFormsModule,
    DatePipe,
    NgForOf,
    JsonPipe,
  ],
  templateUrl: './load-version-note.component.html',
  styleUrl: './load-version-note.component.scss',
})
export class LoadVersionNoteComponent implements AfterViewInit {

  constructor(private datePipe: DatePipe) {
    effect(() => {
      this.dataSource().sort = this.sort;
    });
  }

  @ViewChild(MatSort) sort: MatSort;

  loadVersionActivities = input.required<LoadVersionActivity[]>();

  unwoundActivities = computed(() => {
    return (this.loadVersionActivities() || []).flatMap(activity =>
      activity.notes.map(note => ({
        activityId: activity.id!,
        note: note.notes,
        hashtags: note.hashtags,
        createdBy: note.createdBy,
        createdTime: note.createdTime
      })),
    );
  });

  dataSource = computed(() => {
    const dataSource = new MatTableDataSource<ActivityNoteSortable>(this.unwoundActivities());
    dataSource.filterPredicate = (data: ActivityNoteSortable) => {
      let hashtagMatched = true;
      if (this.searchCriteria.getRawValue().hashtags?.length) {
        hashtagMatched = data.hashtags.includes((this.searchCriteria.getRawValue().hashtags || ''));
      }
      let createdByMatch = true;
      if (this.searchCriteria.getRawValue().createdBy?.length) {
        createdByMatch = data.createdBy.toLowerCase().includes((this.searchCriteria.getRawValue().createdBy || '').toLowerCase());
      }
      let activityIdMatch = true;
      if (this.searchCriteria.getRawValue().activityId?.length) {
        const dateAsString = this.datePipe.transform(data.activityId, 'yyyy-MM-dd');
        activityIdMatch = dateAsString!.toLowerCase().includes((this.searchCriteria.getRawValue().activityId || '').toLowerCase());
      }
      let noteMatch = true;
      if (this.searchCriteria.getRawValue().note?.length) {
        noteMatch = data.note.toLowerCase().includes((this.searchCriteria.getRawValue().note || '').toLowerCase());
      }
      return hashtagMatched && createdByMatch && activityIdMatch && noteMatch;
    };
    return dataSource;
  });

  usersList = computed(() => {
    return new Set(this.unwoundActivities().map(ua => ua.createdBy));
  });

  hashtagsList = computed(() => {
    return new Set(this.loadVersionActivities().flatMap(activity =>
      activity.notes.flatMap(note => note.hashtags),
    ));
  });

  notesColumns: string[] = ['activityId', 'hashtags', 'note', 'createdBy', 'createdTime'];
  searchRowColumns = this.notesColumns.map(c => `${c}-search`);

  ngAfterViewInit(): void {
    this.searchCriteria.valueChanges.pipe(tap({ next: () => this.applyFilter() })).subscribe();
  }

  searchCriteria = new FormGroup(
    {
      activityId: new FormControl<string | undefined>(undefined),
      note: new FormControl<string | undefined>(undefined),
      hashtags: new FormControl<string | undefined>(undefined),
      createdBy: new FormControl<string | undefined>(undefined),
    }, { updateOn: 'change' },
  );

  applyFilter() {
    this.dataSource().filter = this.searchCriteria.getRawValue().toString();
  }

}
