import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, tap } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../environments/environment';
import { AlertService } from './alert-service';
import { User } from '../model/user';

const fakeUser: User = {
  "userID": '',
  "credentialType": '',
  "firstName": '',
  "authenticationDate": '',
  "isFromNewLogin": '',
  "authenticationMethod": '',
  "successfulAuthenticationHandlers": '',
  "longTermAuthenticationRequestTokenUsed": '',
  "email": "fakeemail@nih.gov",
  "lastName": "fake last name",
  "idpUserOrg": "fake idp",
  "success": true,
  "userStatus": "fakeStatus",
  "jwtToken": "fakeToken",
  "utsUser": {
    "username": "fakeUsername",
    "apiKey": "fakeUser-api-key",
    "idpUserOrg": "google",
    "firstName": "fakeUserFirstName",
    "lastName": "fakeUserLastName"
  }
}

@Injectable({providedIn: 'root'})
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
      service: window.location.origin,
      ticket,
    };
    return (['integration', 'prod'].includes(environment.environmentName) ? of(fakeUser) : this.http.get<User>(`${environment.ticketUrl}`, {params}))
      .pipe(
        tap({
          next: (res) => {
            this._user$.next(res);
            localStorage.setItem('user', JSON.stringify(res));
            this.router.navigate(['/load-requests']);
          },
          error: () => {
            this.alertService.addAlert('danger', 'error log in');
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
