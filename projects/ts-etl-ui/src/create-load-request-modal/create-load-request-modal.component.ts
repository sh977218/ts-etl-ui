import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { tap } from 'rxjs';

import { UserService } from '../user-service';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './create-load-request-modal.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class CreateLoadRequestModalComponent {
  loadRequestCreationForm = new FormGroup(
    {
      codeSystemName: new FormControl<string>('', [Validators.required]),
      sourceFilePath: new FormControl<string>('', [Validators.required]),
      requestSubject: new FormControl<string>('', [Validators.required]),
      requester: new FormControl({value: '', disabled: true}),
      requestTime: new FormControl({value: new Date(), disabled: true})
    },
  );

  constructor(public http: HttpClient,
              public dialogRef: MatDialogRef<CreateLoadRequestModalComponent>,
              public userService: UserService) {
    userService.user$.subscribe(user => this.loadRequestCreationForm.get('requester')?.setValue(user?.utsUser.username || ''))
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file) {
        this.loadRequestCreationForm.get('sourceFilePath')?.setValue(file.name);
      }
    }
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
