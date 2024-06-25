import { Routes } from '@angular/router';

import { PleaseLogInComponent } from './please-log-in/please-log-in.component';
import { LoginCbComponent } from './login-cb/login-cb.component';
import { LoadRequestComponent } from './load-request/load-request.component';
import { VersionQaComponent } from './version-qa/version-qa.component';
import { CodeSystemComponent } from './code-system/code-system.component';
import { logInGuard } from './app.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/load-request', pathMatch: 'full' },
  {
    path: 'load-request', component: LoadRequestComponent, title: 'Load Request',
    canActivate: [logInGuard],
  },
  {
    path: 'load-version', component: VersionQaComponent, title: 'Load Version',
    canActivate: [logInGuard],
  },
  {
    path: 'code-system', component: CodeSystemComponent, title: 'Code System',
    canActivate: [logInGuard],
  },
  {
    path: 'please-log-in', component: PleaseLogInComponent, title: 'Please Log In',
  },
  {
    path: 'login-cb', component: LoginCbComponent,
  },
];
