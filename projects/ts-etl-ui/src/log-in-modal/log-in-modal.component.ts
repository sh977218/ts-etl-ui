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
    const loginServiceUrlDomain = ['development'].includes(environment.environmentName) ? `${window.location.hostname}/` : ``;
    console.log(`loginServiceUrlDomain: ${loginServiceUrlDomain}`);
    const loginURL = `${loginServiceUrlDomain}${environment.loginServiceUrl}?service=` + window.location.origin + '/login-cb';
    window.location.href = loginURL;
  }

}
