import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';

const localStorageJwtTokenKey = 'jwtToken';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor() {
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  intercept(request: HttpRequest<any>, next: HttpHandler){
    const jwtToken = localStorage.getItem(localStorageJwtTokenKey);

    if (jwtToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer  ${localStorage.getItem(localStorageJwtTokenKey)}`,
        },
      });
    }
    return next.handle(request);
  }
}
