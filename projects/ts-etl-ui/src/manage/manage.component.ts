import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDrawer, MatDrawerContainer, MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { LoadRequestComponent } from '../load-request/load-request.component';
import { VersionQaComponent } from '../version-qa/version-qa.component';
import { CodeSystemComponent } from '../code-system/code-system.component';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../user-service';

@Component({
  selector: 'app-manage',
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
  templateUrl: './manage.component.html',
  styleUrl: './manage.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ManageComponent {

  constructor(public http: HttpClient,
              public userService: UserService,
              private router: Router,
              public dialog: MatDialog) {
    userService.user$.subscribe(u => {
      if (!u) {
        router.navigate(['please-log-in']);
      }
    });
  }

}
