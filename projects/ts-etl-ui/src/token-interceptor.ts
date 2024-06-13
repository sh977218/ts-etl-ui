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
      const pr = hostname
        .replace('ts-etl-ui-pr-', '')
        .replace('.onrender.com', '')
        .trim();
      const ci = 'true';
      request = request.clone({
        setHeaders: { pr, ci },
      });
    }
    return next.handle(request);
  }
}
