import { HttpClient } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { switchMap, tap } from 'rxjs';

import { AlertService } from '../service/alert-service';
import { UserService } from '../service/user-service';

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
              private cookieService: CookieService,
  ) {
    activatedRoute.queryParamMap
      .pipe(
        switchMap(qp => {
          const ticket = qp.get('ticket');
          if (ticket) {
            return userService.logInWithTicket(ticket);
          } else {
            throw new Error('No ticket found.');
          }
        }),
        tap({
          next: () => {
            router.navigate(['/']);
          },
          error: () => {
            cookieService.delete('Bearer');
            router.navigate(['/please-log-in']);
          },
        }),
      ).subscribe();
  }

}
