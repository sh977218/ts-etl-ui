import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle
} from '@angular/material/dialog';

class DialogData {
}

@Component({
  template: `
    <h2 mat-dialog-title>Confirm</h2>
    <mat-dialog-content>
        <p>Confirm this action</p>
    </mat-dialog-content>
    <mat-dialog-actions>
        <button mat-fab extended [mat-dialog-close]="false">Cancel</button>
        <button mat-fab extended [mat-dialog-close]="true" color="" cdkFocusInitial>Confirm</button>
    </mat-dialog-actions>`,
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
})
export class ConfirmDialogComponent {
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
}
