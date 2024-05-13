import { Component } from '@angular/core';
import {
  MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [
    MatDialogModule,
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './log-in-modal.component.html'
})
export class LogInModalComponent {

  constructor() {
  }

  redirectToLogin(){
    window.location.href = 'https://uts.nlm.nih.gov/uts/login?service='+encodeURIComponent(window.location.origin)
  }

}
