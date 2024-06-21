import { Routes } from '@angular/router';
import { ManageComponent } from './manage/manage.component';
import { PleaseLogInComponent } from './please-log-in/please-log-in.component';
import { LoginCbComponent } from './login-cb/login-cb.component';
import { LoadRequestComponent } from './load-request/load-request.component';
import { VersionQaComponent } from './version-qa/version-qa.component';
import { CodeSystemComponent } from './code-system/code-system.component';
import { logInGuard } from './app.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/manage', pathMatch: 'full' },
  {
    path: 'manage', component: ManageComponent,
    canActivate: [logInGuard],
    children: [
      { path: '', redirectTo: 'load-request', pathMatch: 'full' },
      { path: 'load-request', component: LoadRequestComponent, title: 'Load Request' },
      { path: 'load-version', component: VersionQaComponent, title: 'Load Version' },
      { path: 'code-system', component: CodeSystemComponent, title: 'Code System' },
    ],
  },
  {
    path: 'please-log-in', component: PleaseLogInComponent, title: 'Please Log In',
  },
  {
    path: 'login-cb', component: LoginCbComponent,
  },
];
