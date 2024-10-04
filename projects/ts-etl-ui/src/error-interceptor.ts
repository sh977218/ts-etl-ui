import { HttpRequest, HttpHandler, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, tap } from 'rxjs';

import { AlertService } from './service/alert-service';
import { LoadingService } from './service/loading-service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  loadingService = inject(LoadingService);
  alertService = inject(AlertService);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    return next.handle(request)
      .pipe(
        tap({
            next: () => this.loadingService.showLoading(),
            error: (e: HttpErrorResponse) => {
              this.loadingService.hideLoading();
              this.alertService.addAlert('danger', e.message || 'something broken');
            },
            complete: () => this.loadingService.hideLoading(),
          },
        ),
        finalize(() => this.loadingService.hideLoading()),
      );
  }
}
