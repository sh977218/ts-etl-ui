import { PlatformLocation } from '@angular/common';
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
  constructor(public platformLocation: PlatformLocation) {
  }

  protected readonly environment = environment;
  protected readonly window
    = window;
}