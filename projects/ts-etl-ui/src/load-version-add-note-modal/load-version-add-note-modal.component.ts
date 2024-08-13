import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonModule, NgForOf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
      hashtags: new FormArray([
        new FormControl<string>(''),
      ]),
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
      const index = hashtagsSig.indexOf(hashtag);
      if (index < 0) {
        return hashtagsSig;
      }

      hashtagsSig.splice(index, 1);
      this.announcer.announce(`removed ${hashtag}`);
      return [...hashtagsSig];
    });
  }

  addHashtag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.hashtagsSig.update(hashtagsSig => [...hashtagsSig, value]);
    }
    event.chipInput!.clear();
  }


  // sanitizeHashtags(i: number) {
  //   const currentControl = this.hashtags.controls[i];
  //   currentControl.setValue(currentControl.value.replace(/[^a-zA-Z0-9.\n]/g, ''));
  //   this.hashtags.controls.forEach((fc, i) => {
  //     if(this.hashtags.controls[i].value === '' && this.hashtags.controls.length !== (i+ 1)) {
  //       this.hashtags.removeAt(i);
  //     }
  //   });
  //   if(this.hashtags.controls[this.hashtags.controls.length - 1].value !== '') {
  //     this.hashtags.push(new FormControl(''));
  //   }
  // }

}
