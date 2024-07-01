import { Routes } from '@angular/router';

import { PleaseLogInComponent } from './please-log-in/please-log-in.component';
import { LoginCbComponent } from './login-cb/login-cb.component';
import { LoadRequestComponent } from './load-request/load-request.component';
import { VersionQaComponent } from './version-qa/version-qa.component';
import { CodeSystemComponent } from './code-system/code-system.component';
import { VersionQaReportComponent } from './version-qa-report/version-qa-report.component';
import { logInGuard } from './app.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/load-requests', pathMatch: 'full' },
  {
    path: 'load-requests', component: LoadRequestComponent, title: 'Load Requests',
    canActivate: [logInGuard],
  },
  {
    path: 'load-versions', component: VersionQaComponent, title: 'Load Versions',
    canActivate: [logInGuard],
  },
  {
    path: 'code-systems', component: CodeSystemComponent, title: 'Code Systems',
    canActivate: [logInGuard],
  },
  {
    path: 'version-qa-report/:requestId', component: VersionQaReportComponent, title: 'Version QA Report',
    canActivate: [logInGuard],
  },
  {
    path: 'please-log-in', component: PleaseLogInComponent, title: 'Please Log In',
  },
  {
    path: 'login-cb', component: LoginCbComponent,
  },
];
