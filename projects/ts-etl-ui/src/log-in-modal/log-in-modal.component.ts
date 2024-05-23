import { Component } from '@angular/core';
import {
  MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { environment } from '../environments/environment';

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

  redirectToLogin(){
    window.location.href = `${environment.loginServiceUrl}?service=`+encodeURIComponent(window.location.origin)
  }

}
