import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../service/user-service';
import { EMPTY, switchMap, tap } from 'rxjs';
import { AlertService } from '../service/alert-service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  standalone: true,
  imports: [RouterModule],
  templateUrl: './login-cb.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class LoginCbComponent {
  constructor(public router: Router,
              public activatedRoute: ActivatedRoute,
              public http: HttpClient,
              public dialog: MatDialog,
              public userService: UserService,
              public alertService: AlertService,
              cookieService: CookieService,
  ) {
    activatedRoute.queryParamMap
      .pipe(
        switchMap(qp => {
          const ticket = qp.get('ticket') || '';
          if (ticket) {
            return userService.logInWithTicket(ticket);
          } else {
            return EMPTY;
          }
        }),
        tap({
          next: (res) => {
            this.userService.user$.next(res);
            localStorage.setItem('Bearer', cookieService.get('Bearer'));
            this.router.navigate(['/load-requests']);
          },
          error: (e) => {
            this.alertService.addAlert('danger', `error log in ${e}`);
            this.userService.user$.next(null);
            localStorage.removeItem('Bearer');
            this.router.navigate(['/']);
          },
        }),
      ).subscribe();
  }

}
