import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from './service/user-service';
import { map, skipWhile } from 'rxjs';

export const logInGuard = () => {
  const router: Router = inject(Router);
  const userService: UserService = inject(UserService);

  return userService.user$
    .pipe(
      skipWhile(user => {
        return user === undefined;
      }),
      map(u => {
        if (!u?.utsUser) {
          router.navigate(['./please-log-in']);
          return;
        }
        return true;
      }),
    );
};