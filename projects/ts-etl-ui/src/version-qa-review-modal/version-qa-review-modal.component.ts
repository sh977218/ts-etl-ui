import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../user-service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { VersionQAActivity } from '../model/version-qa';

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
  ],
  templateUrl: './version-qa-review-modal.component.html',
})
export class VersionQaReviewModalComponent {

  dataSource: { tag: string };
  reviewForm = new FormGroup(
    {
      createdBy: new FormControl({ value: '', disabled: true }),
      tag: new FormControl({ value: '', disabled: true }),
      notes: new FormControl<string>('', [Validators.required]),
      availableDate: new FormControl(new Date(), [Validators.required]),
    },
  );

  constructor(@Inject(MAT_DIALOG_DATA) public data: { tag: string },
              public dialogRef: MatDialogRef<VersionQaReviewModalComponent>,
              public userService: UserService,
              public dialog: MatDialog,
  ) {
    this.dataSource = data;
    userService.user$.subscribe(user => this.reviewForm.get('createdBy')?.setValue(user?.utsUser.username || ''));
    this.reviewForm.get('tag')?.setValue(this.dataSource.tag);
  }

  save() {
    const newVersionQAActivity: VersionQAActivity = {
      activity: this.dataSource.tag,
      updatedTime: new Date(),
      availableDate: this.reviewForm.get('availableDate')!.value!,
      notes: [
        {
          createdBy: this.reviewForm.get('createdBy')!.value!,
          createdTime: new Date(),
          notes: this.reviewForm.get('notes')!.value!,
        },
      ],
    };
    this.dialogRef.close(newVersionQAActivity);
  }

}
