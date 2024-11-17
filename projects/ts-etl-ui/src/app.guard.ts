import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, skipWhile } from 'rxjs';

import { UserService } from './service/user-service';


export const logInGuard = () => {
  const router: Router = inject(Router);
  const userService: UserService = inject(UserService);

  return userService.user$
    .pipe(
      skipWhile(user => user === undefined),
      map(u => {
        if (!u) {
          router.navigate(['./please-log-in']);
          return;
        }
        return true;
      }),
    );
};