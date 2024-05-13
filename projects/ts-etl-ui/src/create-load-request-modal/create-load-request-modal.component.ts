import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

import { UserService } from '../user-service';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    MatDialogModule,
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatIcon,
    MatInput,
    ReactiveFormsModule,
    FormsModule,
    MatSelect,
    MatOption,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './create-load-request-modal.component.html',
  styleUrl: './create-load-request-modal.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class CreateLoadRequestModalComponent {
  loadRequestCreationForm = new FormGroup(
    {
      codeSystemName: new FormControl<string>('', [Validators.required]),
      sourceFilePath: new FormControl<string>('', [Validators.required]),
      requestSubject: new FormControl<string>('', [Validators.required]),
      requester: new FormControl({value: '', disabled: true}),
      requestDate: new FormControl({value: new Date(), disabled: true})
    },
    {updateOn: 'submit'}
  );

  constructor(public http: HttpClient,
              public dialogRef: MatDialogRef<CreateLoadRequestModalComponent>,
              public userService: UserService) {
    userService.user$.subscribe(user => this.loadRequestCreationForm.get('requester')?.setValue(user?.utsUser.username || ''))
  }

  submitCreateReloadRequest() {
    const newLoadRequest = this.loadRequestCreationForm.getRawValue();
    this.http.post('/api/loadRequest', newLoadRequest)
      .pipe(
        tap({
          next:()=>this.dialogRef.close('success'),
          error:()=>this.dialogRef.close('error')
        })
      )
      .subscribe()
  }

}
