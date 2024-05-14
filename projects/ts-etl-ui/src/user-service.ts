import { Injectable } from '@angular/core';
import { User } from './model/user';
import { HttpClient } from '@angular/common/http';
import { environment } from './environments/environment';
import { BehaviorSubject, tap } from 'rxjs';
import { AlertService } from './alert-service';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class UserService {
  private _user$ = new BehaviorSubject<User | null>(null);

  constructor(public http: HttpClient,
              public router: Router,
              public alertService: AlertService) {
  }

  get user$() {
    return this._user$;
  }

  logInWithTicket(ticket: string) {
    const params = {
      service: window.location.origin,
      ticket
    }
    return this.http.get<User>(`${environment.ticketUrl}`, {params})
      .pipe(
        tap({
          next: (res) => {
            this.alertService.addAlert('danger', 'logged in');
            this._user$.next(res);
            this.router.navigate(['/'])
          },
          error: () => {
            this.alertService.addAlert('danger', 'error log in');
            this._user$.next(null);
            this.router.navigate(['/'])
          }
        })
      )
  }

  logOut() {
    this._user$.next(null);
  }
}
