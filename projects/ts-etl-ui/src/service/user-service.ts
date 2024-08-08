import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';

import { environment } from '../environments/environment';
import { User } from '../model/user';


@Injectable({ providedIn: 'root' })
export class UserService {
  private _user$ = new BehaviorSubject<User | null | undefined>(undefined);

  constructor(public http: HttpClient,
              public router: Router,
              private cookieService: CookieService) {
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
    this.http.post(`${environment.logoutUrl}`, {}).subscribe();
    this.cookieService.delete('Bearer');
    this.router.navigate(['/please-log-in']);
  }
}
