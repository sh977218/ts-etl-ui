import { CommonModule, NgForOf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { RuleMessage, RuleUI } from '../model/load-version';

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

  groupedMessages = this.data.messages.reduce((groups, message) => {
    const group = message.messageGroup;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(message);
    return groups;
  }, {} as { [key: string]: RuleMessage[] });

  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: RuleUI
  ) {
  }

}
