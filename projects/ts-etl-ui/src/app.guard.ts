import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from './service/user-service';
import { map } from 'rxjs';

export const logInGuard = () => {
  const router: Router = inject(Router);
  const userService: UserService = inject(UserService);

  return userService.user$.pipe(map(u => {
    if (u?.utsUser?.username) {
      return true;
    } else {
      router.navigate(['./please-log-in']);
      return false;
    }
  }));
};