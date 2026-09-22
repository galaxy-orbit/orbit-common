export class HttpException extends Error {
  constructor(
    private readonly response: string | Record<string, any>,
    private readonly status: number,
  ) {
    super();
    this.initMessage();
    this.initName();
  }

  private initMessage(): void {
    if (typeof this.response === 'string') {
      this.message = this.response;
    } else if (typeof this.response === 'object' && this.response.message) {
      this.message = Array.isArray(this.response.message)
        ? this.response.message.join(', ')
        : this.response.message;
    }
  }

  private initName(): void {
    this.name = this.constructor.name;
  }

  getResponse(): string | Record<string, any> {
    return this.response;
  }

  getStatus(): number {
    return this.status;
  }

  toJSON(): Record<string, any> {
    return {
      statusCode: this.status,
      message: this.message,
      error: this.name.replace('Exception', ''),
    };
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string | Record<string, any> = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string | Record<string, any> = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string | Record<string, any> = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string | Record<string, any> = 'Not Found') {
    super(message, 404);
  }
}

export class MethodNotAllowedException extends HttpException {
  constructor(message: string | Record<string, any> = 'Method Not Allowed') {
    super(message, 405);
  }
}

export class NotAcceptableException extends HttpException {
  constructor(message: string | Record<string, any> = 'Not Acceptable') {
    super(message, 406);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string | Record<string, any> = 'Conflict') {
    super(message, 409);
  }
}

export class GoneException extends HttpException {
  constructor(message: string | Record<string, any> = 'Gone') {
    super(message, 410);
  }
}

export class PayloadTooLargeException extends HttpException {
  constructor(message: string | Record<string, any> = 'Payload Too Large') {
    super(message, 413);
  }
}

export class UnsupportedMediaTypeException extends HttpException {
  constructor(message: string | Record<string, any> = 'Unsupported Media Type') {
    super(message, 415);
  }
}

export class UnprocessableEntityException extends HttpException {
  constructor(message: string | Record<string, any> = 'Unprocessable Entity') {
    super(message, 422);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string | Record<string, any> = 'Internal Server Error') {
    super(message, 500);
  }
}

export class NotImplementedException extends HttpException {
  constructor(message: string | Record<string, any> = 'Not Implemented') {
    super(message, 501);
  }
}

export class BadGatewayException extends HttpException {
  constructor(message: string | Record<string, any> = 'Bad Gateway') {
    super(message, 502);
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message: string | Record<string, any> = 'Service Unavailable') {
    super(message, 503);
  }
}

export class GatewayTimeoutException extends HttpException {
  constructor(message: string | Record<string, any> = 'Gateway Timeout') {
    super(message, 504);
  }
}
