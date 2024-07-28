import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../service/user-service';
import { switchMap } from 'rxjs';

@Component({
  standalone: true,
  imports: [RouterModule],
  templateUrl: './login-cb.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class LoginCbComponent {
  constructor(public activatedRoute: ActivatedRoute,
              public http: HttpClient,
              public dialog: MatDialog,
              public userService: UserService,
  ) {
    activatedRoute.queryParamMap
      .pipe(
        switchMap(qp => {
          const ticket = qp.get('ticket') || '';
          return userService.logInWithTicket(ticket);
        }),
      ).subscribe();
  }

}
