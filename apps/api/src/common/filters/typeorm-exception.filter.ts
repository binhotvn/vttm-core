import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const driverError = exception.driverError as any;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';

    // PostgreSQL unique violation
    if (driverError?.code === '23505') {
      status = HttpStatus.CONFLICT;
      message = 'Resource already exists';
    }
    // Foreign key violation
    else if (driverError?.code === '23503') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Referenced resource does not exist';
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
