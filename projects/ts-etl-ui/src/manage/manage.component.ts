import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatDrawer, MatDrawerContainer, MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';

import { CodeSystemComponent } from '../code-system/code-system.component';
import { LoadRequestComponent } from '../load-request/load-request.component';
import { VersionQaComponent } from '../version-qa/version-qa.component';
import { NavigationService } from '../navigation-service';

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
    CodeSystemComponent,
    NgForOf,
  ],
  templateUrl: './manage.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class ManageComponent {
  constructor(public navigationService: NavigationService) {
  }
}
