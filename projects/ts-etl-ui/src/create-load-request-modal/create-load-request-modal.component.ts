import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

import { LoadRequest } from '../model/load-request';
import { sourceFilePathValidator } from '../service/app.validator';
import { ConstantService } from '../service/constant-service';
import { UserService } from '../service/user-service';

@Component({
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    NgIf,
    NgForOf,
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
    MatListModule,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    AsyncPipe,
  ],
  templateUrl: './create-load-request-modal.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class CreateLoadRequestModalComponent {
  CODE_SYSTEM_REQUIRED_SOURCE_FILE: Record<string, string[]> = {
    RXNORM: [],
    LOINC: [],
    SNOMEDCT: [
      `/Snapshot/Terminologylsct2_Relationship_Snapshot/w*.txt`,
      `/Snapshot/Refset/Languagelder2_cRefset_LanguageSnapshot`,
      `/Snapshot/Terminologylsct2_Description_Snapshot-en/w*.txt`,
    ],
    CDCREC: [],
    CPT: [],
    HPO: [],
  };

  loadRequestCreationForm = new FormGroup(
    {
      requestType: new FormControl<string>('', [Validators.required]),
      codeSystemName: new FormControl<string>('', [Validators.required]),
      sourceFilePath: new FormControl<string>('', [Validators.required, sourceFilePathValidator()]),
      requestSubject: new FormControl<string>('', [Validators.required]),
      notificationEmail: new FormControl('', [Validators.required, Validators.email]),
      requester: new FormControl<string>({ value: '', disabled: true }),
      requestTime: new FormControl<Date>({ value: new Date(), disabled: true }),
    },
  );

  futureDateFilter = (d: Date | null): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (d || new Date()) >= today;
  };

  constructor(
    public userService: UserService,
    public constantService: ConstantService,
    @Inject(MAT_DIALOG_DATA) public existingLoadRequest: LoadRequest) {
    userService.user$.subscribe(user => this.loadRequestCreationForm.get('requester')?.setValue(user?.utsUser.username || ''));
    this.loadRequestCreationForm.get('requestType')?.valueChanges.subscribe(value => {
      if (value === 'Scheduled') {
        this.form.addControl('scheduledDate', new FormControl<Date | undefined>(undefined, [Validators.required]));
        this.form.addControl('scheduledTime', new FormControl<Date | undefined>(undefined, [Validators.required]));
      } else {
        this.form.removeControl('scheduledDate');
        this.form.removeControl('scheduledTime');
      }
    });
    if (this.existingLoadRequest) {
      this.loadRequestCreationForm.patchValue(existingLoadRequest);
    }
  }

  get form() {
    return this.loadRequestCreationForm as FormGroup;
  }

  onFileSelected(event: Event) {
    const DEFAULT_FOLDER = `file://nlmsombaserver.nlm.nih.gov/dev-ts-data-import/`;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file) {
        const webkitRelativePathArray = file.webkitRelativePath.split('/');
        const folder = webkitRelativePathArray[0];
        this.loadRequestCreationForm.get('sourceFilePath')?.setValue(`${DEFAULT_FOLDER}${folder}`);
      }
    }
  }
}
