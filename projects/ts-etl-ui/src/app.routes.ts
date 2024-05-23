import { Routes } from '@angular/router';
import { ManageComponent } from './manage/manage.component';
import { PleaseLogInComponent } from './please-log-in/please-log-in.component';
import { LoginCbComponent } from './login-cb/login-cb.component';

export const routes: Routes = [
  { path: '', component: ManageComponent },
  { path: 'please-log-in', component: PleaseLogInComponent },
  { path: 'login-cb', component: LoginCbComponent },
];
