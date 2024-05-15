import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDrawer, MatDrawerContainer, MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { LogInModalComponent } from '../log-in-modal/log-in-modal.component';
import { MatToolbar } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../user-service';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { LoadRequestComponent } from '../load-request/load-request.component';
import { VersionQaComponent } from '../version-qa/version-qa.component';
import { CodeSystemComponent } from '../code-system/code-system.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    MatDialogModule,
    MatSidenavContainer,
    MatNavList,
    MatIcon,
    MatListItem,
    MatButton,
    MatIconButton,
    MatSidenav,
    MatDrawerContainer,
    MatDrawer,
    MatToolbar,
    NgIf,
    AsyncPipe,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
    MatTabGroup,
    MatTab,
    LoadRequestComponent,
    VersionQaComponent,
    CodeSystemComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppComponent {
  title = 'ts-etl-ui';
  currentApplicationVersion = `${environment.appVersion}`

  constructor(public activatedRoute: ActivatedRoute,
              public http: HttpClient,
              public userService: UserService,
              public dialog: MatDialog) {
    activatedRoute.queryParamMap.subscribe(qp => {
      const ticket = qp.get('ticket')
      if (ticket) {
        userService.logInWithTicket(ticket).subscribe()
      }
    })
  }

  openLoginModal() {
    this.dialog
      .open(LogInModalComponent)
      .afterClosed()
      .subscribe((res) => {
        console.log(res)
      });
  }
}
