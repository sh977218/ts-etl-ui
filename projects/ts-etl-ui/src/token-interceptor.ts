import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const localStorageJwtTokenKey = 'jwtToken';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const http = this.injector.get(HttpClient);
    const router = this.injector.get(Router);

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
