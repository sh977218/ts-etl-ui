import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../service/user-service';

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
    activatedRoute.queryParamMap.subscribe(qp => {
      const ticket = qp.get('ticket');
      if (ticket) {
        userService.logInWithTicket(ticket).subscribe();
      }
    });
  }

}
