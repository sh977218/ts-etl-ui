import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';

const localStorageJwtTokenKey = 'jwtToken';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor() {
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const jwtToken = localStorage.getItem(localStorageJwtTokenKey);
    const hostname = window.location.hostname;
    // for debug use only
    // const hostname = 'ts-etl-ui-pr-91';

    if (jwtToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer  ${localStorage.getItem(localStorageJwtTokenKey)}`,
        },
      });
    }

    if (hostname.includes('ts-etl-ui-pr-')) {
      const PR_NUMBER = hostname
        .replace('ts-etl-ui-pr-', '')
        .replace('.onrender.com', '')
        .trim();
      const DB_NAME = 'ci';
      request = request.clone({
        setHeaders: { pr: PR_NUMBER, DB_NAME },
      });
    }
    return next.handle(request);
  }
}
