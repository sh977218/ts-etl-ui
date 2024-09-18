import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Inject, NO_ERRORS_SCHEMA } from '@angular/core';
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
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { format, eachHourOfInterval, endOfDay } from 'date-fns';
import { roundToNearestMinutes } from 'date-fns/roundToNearestMinutes';
import { map, tap } from 'rxjs';

import { environment } from '../environments/environment';
import { LoadRequest } from '../model/load-request';
import { PropertyResponse } from '../model/property';
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
    CdkCopyToClipboard,
  ],
  templateUrl: './create-load-request-modal.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class CreateLoadRequestModalComponent {
  userService: UserService = inject(UserService);

  CODE_SYSTEM_REQUIRED_SOURCE_FILE: string[] = [];
  loadRequestCreationForm = new FormGroup(
    {
      requestType: new FormControl<string>('', [Validators.required]),
      codeSystemName: new FormControl<string>('', [Validators.required]),
      sourceFilePath: new FormControl<string>('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/',
        [Validators.required, sourceFilePathValidator()]),
      requestSubject: new FormControl<string>('', [Validators.required]),
      notificationEmail: new FormControl(this.userService.user?.email, [Validators.required, Validators.email]),
      requester: new FormControl<string>({ value: this.userService.user!.utsUser.username!, disabled: true }),
      requestTime: new FormControl<Date>({ value: new Date(), disabled: true }),
    },
  );

  scheduledTimeOptions = () => {
    const start = roundToNearestMinutes(new Date(), { nearestTo: 30, roundingMethod: 'ceil' });
    const end = endOfDay(new Date());

    const scheduledTimeOptionsInDate = eachHourOfInterval({
      start,
      end,
    }, { step: 0.5 });

    return scheduledTimeOptionsInDate.map(date => {
      return format(date, 'hh:mm a');
    });
  };

  futureDateFilter = (d: Date | null): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (d || new Date()) >= today;
  };

  constructor(
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public existingLoadRequest: LoadRequest,
    public constantService: ConstantService,
  ) {
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

  onCodeSystemNameSelectChange(event: MatSelectChange) {
    const codeSystemName = event.value;
    /* istanbul ignore else */
    if (!this.constantService.CODE_SYSTEM_REQUIRED_SOURCE_FILE.get(codeSystemName)) {
      this.http.get<PropertyResponse>(`${environment.newApiServer}/property/data-files/${codeSystemName}`)
        .pipe(
          map((res) => res.result.data as string[]),
          tap(res => {
            this.constantService.CODE_SYSTEM_REQUIRED_SOURCE_FILE.set(codeSystemName, res);
            this.CODE_SYSTEM_REQUIRED_SOURCE_FILE = res;
          }),
        )
        .subscribe();
    } else {
      this.CODE_SYSTEM_REQUIRED_SOURCE_FILE = this.constantService.CODE_SYSTEM_REQUIRED_SOURCE_FILE.get(codeSystemName) || [];
    }
  }
}
