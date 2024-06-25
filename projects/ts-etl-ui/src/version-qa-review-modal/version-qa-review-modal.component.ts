import { NgForOf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { UserService } from '../user-service';

@Component({
  selector: 'app-version-qa-review-modal',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
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
  templateUrl: './version-qa-review-modal.component.html',
})
export class VersionQaReviewModalComponent {
  dataSource: { tag: string };
  reviewForm = new FormGroup(
    {
      createdBy: new FormControl<string>({ value: '', disabled: true }),
      activity: new FormControl<string>({ value: '', disabled: true }),
      availableDate: new FormControl<Date>(new Date(), [Validators.required]),
      notes: new FormArray([
        new FormGroup({
          notes: new FormControl<string>('', [Validators.required]),
          createdTime: new FormControl<Date>(new Date()),
          createdBy: new FormControl<string>({ value: '', disabled: true }),
        }),
      ]),
    },
  );

  constructor(@Inject(MAT_DIALOG_DATA) public data: { tag: string },
              public userService: UserService,
              public dialog: MatDialog,
  ) {
    this.dataSource = data;
    userService.user$.subscribe(user => {
      this.reviewForm.get('createdBy')?.setValue(user?.utsUser.username || '');
      this.notes.at(0)?.get('createdBy')?.setValue(user?.utsUser.username || '');
    });
    this.reviewForm.get('activity')?.setValue(this.dataSource.tag);
  }

  get notes() {
    return this.reviewForm.controls['notes'] as FormArray;
  }

}
