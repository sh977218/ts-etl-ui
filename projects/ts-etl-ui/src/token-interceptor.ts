import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  /* eslint-disable @typescript-eslint/no-explicit-any */
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    return next.handle(request);
  }
}
