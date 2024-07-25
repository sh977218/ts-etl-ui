export class TSError extends Error {
  constructor() {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.status = 500;
    this.message = 'An error occurred. We have no more information at this time.';
  }
}

export class NotFoundError extends TSError {
  constructor() {
    super();
    this.message = '404 Resource Not Found';
    this.status = 404;
  }
}

export class UnauthorizedError extends TSError {
  constructor(message) {
    super();
    this.message = message || '401 - Not Authorized';
    this.status = 401;
  }
}
