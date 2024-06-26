import { provideNativeDateAdapter } from '@angular/material/core';
import { NgForOf, NgIf } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

import { UserService } from '../user-service';
import { sourceFilePathValidator } from '../service/app.validator';

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
  ],
  templateUrl: './create-load-request-modal.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class CreateLoadRequestModalComponent implements AfterViewInit {
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
      type: new FormControl<string>('', [Validators.required]),
      codeSystemName: new FormControl<string>('', [Validators.required]),
      sourceFilePath: new FormControl<string>('', [Validators.required, sourceFilePathValidator()]),
      requestSubject: new FormControl<string>('', [Validators.required]),
      requester: new FormControl({ value: '', disabled: true }),
      requestTime: new FormControl({ value: new Date(), disabled: true }),
      scheduleDate: new FormControl({ value: '', disabled: false }),
    },
  );

  futureDateFilter = (d: Date | null): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (d || new Date()) >= today;
  };

  constructor(
    public dialogRef: MatDialogRef<CreateLoadRequestModalComponent>,
    public userService: UserService) {
    userService.user$.subscribe(user => this.loadRequestCreationForm.get('requester')?.setValue(user?.utsUser.username || ''));
  }

  ngAfterViewInit() {
    this.loadRequestCreationForm.get('type')!.valueChanges.subscribe(value => {
      if (value === 'scheduled') {
        this.loadRequestCreationForm.get('scheduleDate')?.setValidators([Validators.required]);
      } else {
        this.loadRequestCreationForm.get('scheduleDate')?.clearValidators();
      }
      this.loadRequestCreationForm.get('scheduleDate')?.updateValueAndValidity();
    });
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
