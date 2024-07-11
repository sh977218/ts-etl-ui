import { CommonModule, NgForOf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-version-qa-review-modal',
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
  templateUrl: './version-qa-add-note-modal.component.html',
})
export class VersionQaAddNoteModalComponent {
  addNoteForm = new FormGroup(
    {
      hashtags: new FormControl<string>(''),
      notes: new FormControl<string>('', [Validators.required]),
    },
  );

  constructor(public dialog: MatDialog,
  ) {
    // TODO hashtag is pre-filled with the ruleName, but I don't know what that is at the moment. So we will do later.
  }

}
