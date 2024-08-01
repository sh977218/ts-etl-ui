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
    window.location.href = `${environment.loginServiceUrl}?service=` + window.location.origin + `${environment.environmentName === 'prod' ? '/portal-frontend' : ''}/login-cb`;
  }

}
