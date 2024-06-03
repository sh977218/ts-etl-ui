import {NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common'
import {Component, Inject} from '@angular/core'
import {MatButtonModule} from "@angular/material/button"
import {MatTableModule} from '@angular/material/table'
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from "@angular/material/dialog"
import {MatCardModule} from "@angular/material/card";

import {MatDivider} from "@angular/material/divider";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../user-service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { VersionQAReviewModalData } from '../model/version-qa'



@Component({
  selector: 'app-version-qa-review-modal',
  standalone: true,
  imports: [
    FormsModule,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatCardModule,
    MatDivider,
    MatDatepickerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './version-qa-review-modal.component.html'
})
export class VersionQaReviewModalComponent {

  dataSource: VersionQAReviewModalData;
  reviewForm = new FormGroup(
    {
      createdBy: new FormControl({value: '', disabled: true}),
      tag: new FormControl({value: '', disabled: true}),
      notes: new FormControl<string>('', [Validators.required]),
      availableDate: new FormControl(new Date(), [Validators.required]),
    },
  );

  constructor(@Inject(MAT_DIALOG_DATA) public data: VersionQAReviewModalData,
              public dialogRef: MatDialogRef<VersionQaReviewModalComponent>,
              public userService: UserService,
              public dialog: MatDialog,
  ) {
    this.dataSource = data;
    userService.user$.subscribe(user => this.reviewForm.get('createdBy')?.setValue(user?.utsUser.username || ''))
    this.reviewForm.get('tag')?.setValue(this.dataSource.tag);
  }

  save() {
    this.dialogRef.close(this.reviewForm.getRawValue());
  }

}
