import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../environments/environment';
import { AlertService } from './alert-service';
import { User } from '../model/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private _user$ = new BehaviorSubject<User | null>(null);

  constructor(public http: HttpClient,
              public router: Router,
              public alertService: AlertService) {
    const locUser = localStorage.getItem('user');
    if (locUser) {
      this._user$.next(JSON.parse(locUser));
    }
  }

  get user$() {
    return this._user$;
  }

  logInWithTicket(ticket: string) {
    const params = {
      service: window.location.origin + `${['prod'].includes(environment.environmentName)? '/portal-frontend' : ''}/login-cb`,
      ticket,
      app: 'angular',
    };
    return this.http.get<User>(`${environment.ticketUrl}`, { params })
      .pipe(
        tap({
          next: (res) => {
            this._user$.next(res);
            localStorage.setItem('user', JSON.stringify(res));
            this.router.navigate(['/load-requests']);
          },
          error: (e) => {
            this.alertService.addAlert('danger', `error log in ${e}`);
            this._user$.next(null);
            this.router.navigate(['/']);
          },
        }),
      );
  }

  logOut() {
    this._user$.next(null);
    localStorage.removeItem('user');
    this.router.navigate(['/please-log-in']);
  }
}
