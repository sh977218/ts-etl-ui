import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor() {}

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  handleError(error:any) {
    console.error(error)
  }
}
