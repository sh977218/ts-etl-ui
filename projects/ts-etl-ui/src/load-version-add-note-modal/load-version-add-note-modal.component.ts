import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonModule, NgForOf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';


@Component({
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    FormsModule,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    MatChipsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIcon,
    MatInputModule,
    MatCardModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    NgForOf,
  ],
  templateUrl: './load-version-add-note-modal.component.html',
})
export class LoadVersionAddNoteModalComponent {
  addNoteForm = new FormGroup(
    {
      hashtags: new FormControl<string[]>([]),
      notes: new FormControl<string>('', [Validators.required]),
    },
  );

  readonly hashtagsSig = signal<string[]>([]);
  announcer = inject(LiveAnnouncer);

  constructor(public dialog: MatDialog,
  ) {
    // TODO hashtag is pre-filled with the ruleName, but I don't know what that is at the moment. So we will do later.
  }

  removeHashtag(hashtag: string) {
    this.hashtagsSig.update(hashtagsSig => {
      hashtagsSig.splice(hashtagsSig.indexOf(hashtag), 1);
      this.announcer.announce(`removed ${hashtag}`);
      return [...hashtagsSig];
    });
  }

  addHashtag(event: MatChipInputEvent): void {
    const value = event.value.trim();
    this.hashtagsSig.update(hashtagsSig => [...hashtagsSig, value]);
    event.chipInput!.clear();
  }

}
