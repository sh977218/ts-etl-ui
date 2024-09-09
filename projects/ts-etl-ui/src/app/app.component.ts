import { AsyncPipe, JsonPipe, NgForOf, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { EMPTY } from 'rxjs';

import { environment } from '../environments/environment';
import { LogInModalComponent } from '../log-in-modal/log-in-modal.component';
import { LoadingService } from '../service/loading-service';
import { NavigationService } from '../service/navigation-service';
import { UserService } from '../service/user-service';

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
              public cookieService: CookieService,
              public loadingService: LoadingService,
              public userService: UserService,
              public navigationService: NavigationService,
  ) {
    const jwtTokenInCookie = cookieService.get('Bearer');
    if (jwtTokenInCookie) {
      userService.logInWithJwt().subscribe();
    } else {
      userService.user$.next(null);
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
