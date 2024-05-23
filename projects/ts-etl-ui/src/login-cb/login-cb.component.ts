import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../user-service';

@Component({
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
  ],
  templateUrl: './login-cb.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class LoginCbComponent {

  constructor(public activatedRoute: ActivatedRoute,
              public http: HttpClient,
              public userService: UserService,
              public dialog: MatDialog) {
    activatedRoute.queryParamMap.subscribe(qp => {
      const ticket = qp.get('ticket')
      if (ticket) {
        userService.logInWithTicket(ticket).subscribe();
      }
    });
  }

}
