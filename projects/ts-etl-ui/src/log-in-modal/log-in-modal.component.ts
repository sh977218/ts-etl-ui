import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

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
    const loginURL= `${environment.loginServiceUrl}?service=` + window.location.origin + `${['prod'].includes(environment.environmentName)? '/portal-frontend' : ''}/login-cb`;
    window.location.href = loginURL
  }

}
