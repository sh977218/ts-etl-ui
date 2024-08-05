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
  protected readonly environment = environment;

  redirectToLogin() {
    const loginURL= `${environment.loginServiceUrl}?service=` + window.location.origin + `${['prod'].includes(this.environment.environmentName)? '/portal-frontend' : ''}/login-cb`;
    console.log(`environment.environmentName: ${this.environment.environmentName}`)
    window.location.href = loginURL
  }

}
