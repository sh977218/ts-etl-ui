import { AsyncPipe, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { MatDrawer, MatDrawerContainer, MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule, } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';

import { UserService } from '../user-service';
import { CodeSystemComponent } from '../code-system/code-system.component';
import { LoadRequestComponent } from '../load-request/load-request.component';
import { VersionQaComponent } from '../version-qa/version-qa.component';

@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    RouterModule,
    MatDialogModule,
    MatSidenavContainer,
    MatNavList,
    MatIconModule,
    MatListItem,
    MatButtonModule,
    MatIconButton,
    MatSidenav,
    MatDrawerContainer,
    MatDrawer,
    MatToolbarModule,
    MatMenuModule,
    MatTabsModule,
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
