import { CommonModule, NgForOf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
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
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
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

  get hashtags(): FormArray {
    return this.addNoteForm.get('hashtags') as FormArray;
  }

  constructor(public dialog: MatDialog,
  ) {
    // TODO hashtag is pre-filled with the ruleName, but I don't know what that is at the moment. So we will do later.
  }

  sanitizeHashtags(i: number) {
    const currentControl = this.hashtags.controls[i];
    currentControl.setValue(currentControl.value.replace(/[^a-zA-Z0-9.\n]/g, ''));
    this.hashtags.controls.forEach((fc, i) => {
      if(this.hashtags.controls[i].value === '' && this.hashtags.controls.length !== (i+ 1)) {
        this.hashtags.removeAt(i);
      }
    });
    if(this.hashtags.controls[this.hashtags.controls.length - 1].value !== '') {
      this.hashtags.push(new FormControl(''));
    }
  }

}
