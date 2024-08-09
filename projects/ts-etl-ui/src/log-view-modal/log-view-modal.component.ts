import { CommonModule, NgForOf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { groupBy } from 'lodash';

import { RuleUI } from '../model/load-version';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    MatDialogModule,
    MatButtonModule,
    NgForOf,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
  ],
  templateUrl: './log-view-modal.component.html',
})
export class LogViewModalComponent {

  groupedMessages = groupBy(this.data.messages, 'messageGroup');

  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: RuleUI,
  ) {
  }
}
