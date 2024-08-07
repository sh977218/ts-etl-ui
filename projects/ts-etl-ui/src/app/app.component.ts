import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AsyncPipe, JsonPipe, NgForOf, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
import { EMPTY } from 'rxjs';

import { LogInModalComponent } from '../log-in-modal/log-in-modal.component';
import { UserService } from '../service/user-service';
import { LoadingService } from '../service/loading-service';
import { NavigationService } from '../service/navigation-service';
import { environment } from '../environments/environment';
import { AlertService } from '../service/alert-service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    AsyncPipe,
    JsonPipe,
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

  constructor(private router: Router,
              public http: HttpClient,
              public dialog: MatDialog,
              public loadingService: LoadingService,
              public userService: UserService,
              public navigationService: NavigationService,
              private alertService: AlertService,
              private cookieService: CookieService,
  ) {
    const jwtTokenInCookie = cookieService.get('Bearer');
    if (jwtTokenInCookie) {
      userService.logInWithJwt().subscribe({
        next: (res) => {
          userService.user$.next(res);
          router.navigate(['/load-requests']);
        },
        error: () => {
          alertService.addAlert('danger', `error log in`);
          userService.user$.next(null);
          cookieService.delete('Bearer');
          router.navigate(['/']);
        },
      });
    }
  }

  openLoginModal() {
    this.dialog
      .open(LogInModalComponent)
      .afterClosed()
      .subscribe((res) => {
        console.log(res);
      });
  }

  serverInfo$ = environment.environmentName === 'ci' ?
    this.http.get<{
      pr: string,
      db: string
    }>(`${environment.apiServer}/serverInfo`) : EMPTY;
}
