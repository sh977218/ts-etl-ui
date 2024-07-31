import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../environments/environment';

@Component({
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './log-in-modal.component.html',
})
export class LogInModalComponent {

  redirectToLogin() {
    // on render.com or PR preview, the login URL needs to be in the same domain
    const loginServiceUrlDomain = ['render'].includes(environment.environmentName) ? `${window.location.hostname}` : ``;
    window.location.href = `${loginServiceUrlDomain}${environment.loginServiceUrl}?service=` + window.location.origin + '/login-cb';
  }

}
