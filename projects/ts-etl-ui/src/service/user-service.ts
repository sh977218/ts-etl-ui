import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../environments/environment';
import { User } from '../model/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private _user$ = new BehaviorSubject<User | null>(null);

  constructor(public http: HttpClient,
              public router: Router) {
  }

  get user$() {
    return this._user$;
  }

  logInWithTicket(ticket: string) {
    const params = {
      service: window.location.origin + `${['prod'].includes(environment.environmentName) ? '/portal-frontend' : ''}/login-cb`,
      ticket,
      app: 'angular',
    };
    return this.http.get<User>(`${environment.ticketUrl}`, { params });
  }

  logInWithJwt() {
    return this.http.get<User>(`${environment.loginUrl}`);
  }

  logOut() {
    this._user$.next(null);
    localStorage.removeItem('Bearer');
    this.router.navigate(['/please-log-in']);
  }
}
