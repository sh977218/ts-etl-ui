import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { LogInModalComponent } from '../log-in-modal/log-in-modal.component';
import { UserService } from '../service/user-service';
import { LoadingService } from '../service/loading-service';
import { NavigationService } from '../service/navigation-service';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    AsyncPipe,
    RouterModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    MatTabsModule,
    MatProgressSpinner,
    NgForOf,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppComponent {

  constructor(public http: HttpClient,
              public dialog: MatDialog,
              public loadingService: LoadingService,
              public userService: UserService,
              public navigationService: NavigationService) {
  }

  openLoginModal() {
    this.dialog
      .open(LogInModalComponent)
      .afterClosed()
      .subscribe((res) => {
        console.log(res);
      });
  }

  serverInfo$ = this.http.get<{ pr: string, db: string }>('/api/serverInfo');
}
