import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private injector: Injector) {
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const cookieService = this.injector.get(CookieService);

    const jwtToken = localStorage.getItem('Bearer');

    if (jwtToken) {
      cookieService.set('Bearer', jwtToken);
    }
    return next.handle(request);
  }
}
