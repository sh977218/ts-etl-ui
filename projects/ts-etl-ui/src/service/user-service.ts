import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { isEmpty } from 'lodash';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, tap } from 'rxjs';

import { AlertService } from './alert-service';

import { environment } from '../environments/environment';
import { User } from '../model/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private _user: User | null | undefined;
  private _user$ = new BehaviorSubject<User | null | undefined>(undefined);

  constructor(public http: HttpClient,
              public router: Router,
              private cookieService: CookieService,
              private alertService: AlertService) {
  }

  get user$() {
    return this._user$;
  }

  get user() {
    return this._user;
  }

  logInWithTicket(ticket: string) {
    /* istanbul ignore next */
    const params = {
      service: window.location.origin + `${['prod'].includes(environment.environmentName) ? '/portal-frontend' : ''}/login-cb`,
      ticket,
      app: 'angular',
    };
    return this.http.get<User>(`${environment.ticketUrl}`, { params })
      .pipe(
        tap({
          next: (res) => {
            this.user$.next(res);
            this._user = res;
          },
          error: () => {
            this.user$.next(null);
            this._user = null;
          },
        }));
  }

  logInWithJwt() {
    return this.http.get<User>(`${environment.loginUrl}`)
      .pipe(
        tap({
          next: (res) => {
            if (isEmpty(res)) {
              this.cookieService.delete('Bearer');
              this.user$.next(null);
              this._user = null;
            } else {
              this.user$.next(res);
              this._user = res;
            }
          },
          error: () => {
            this.user$.next(null);
            this._user = null;
            this.cookieService.delete('Bearer');
          },
        }),
      );
  }

  logOut() {
    this._user$.next(null);
    this.http.post(`${environment.logoutUrl}`, {}).subscribe();
    this.cookieService.delete('Bearer');
    this.router.navigate(['/please-log-in']);
  }
}
