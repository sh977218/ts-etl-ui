import { Routes } from '@angular/router';

import { logInGuard } from './app.guard';
import { CodeSystemComponent } from './code-system/code-system.component';
import { LoadRequestComponent } from './load-request/load-request.component';
import { LoadRequestDetailComponent } from './load-request-detail/load-request-detail.component';
import { LoadVersionComponent } from './load-version/load-version.component';
import { LoadVersionReportComponent } from './load-version-report/load-version-report.component';
import { LoginCbComponent } from './login-cb/login-cb.component';
import { PleaseLogInComponent } from './please-log-in/please-log-in.component';

export const routes: Routes = [
  { path: '', redirectTo: '/load-requests', pathMatch: 'full' },
  {
    path: 'load-requests', component: LoadRequestComponent, title: 'Load Requests',
    canActivate: [logInGuard],
  },
  {
    path: 'load-request/:requestId', component: LoadRequestDetailComponent, title: 'Load Request',
    canActivate: [logInGuard],
  },
  {
    path: 'load-versions', component: LoadVersionComponent, title: 'Load Versions',
    canActivate: [logInGuard],
  },
  {
    path: 'code-systems', component: CodeSystemComponent, title: 'Code Systems',
    canActivate: [logInGuard],
  },
  {
    path: 'load-version-report/:requestId', component: LoadVersionReportComponent, title: 'Version QA Report',
    canActivate: [logInGuard],
  },
  {
    path: 'please-log-in', component: PleaseLogInComponent, title: 'Please Log In',
  },
  {
    path: 'login-cb', component: LoginCbComponent,
  },
];
