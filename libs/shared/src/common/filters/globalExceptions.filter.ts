import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response, Request } from 'express';
import { throwError } from 'rxjs';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const contextType = host.getType();

    if (contextType === 'http') {
      return this.handleHttpException(exception, host);
    } else if (contextType === 'rpc') {
      return this.handleRpcException(exception, host);
    } else {
      return this.handleUnknownException(exception, host);
    }
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, errorCode, additionalDetails } =
      this.getErrorDetails(exception);

    if (exception.constructor.name !== 'BadRequestException') {
      this.logError(
        exception,
        status,
        message,
        errorCode,
        request,
        additionalDetails,
      );
    }

    return response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      errorCode,
      additionalDetails,
    });
  }

  private handleRpcException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToRpc();
    const data = ctx.getData();
    const { status, message, errorCode, additionalDetails } =
      this.getErrorDetails(exception);

    if (exception.constructor.name !== 'BadRequestException') {
      this.logError(
        exception,
        status,
        message,
        errorCode,
        data,
        additionalDetails,
      );
    }

    return throwError(() => ({
      statusCode: status,
      message,
      errorCode,
      additionalDetails,
    }));
  }

  private handleUnknownException(exception: unknown, _: ArgumentsHost): void {
    const { status, message, errorCode, additionalDetails } =
      this.getErrorDetails(exception);

    this.logError(
      exception,
      status,
      message,
      errorCode,
      { url: 'Unknown', method: 'Unknown' }, // данные-заглушки для неизвестного контекста
      additionalDetails,
    );

    throw new Error('Unhandled context type in GlobalExceptionsFilter');
  }

  private getErrorDetails(exception: unknown): {
    status: HttpStatus;
    message: string | object;
    errorCode: string;
    additionalDetails: any;
  } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'string' ? response : response['message'];

      return {
        status: exception.getStatus(),
        message,
        errorCode: 'HTTP_EXCEPTION',
        additionalDetails: { details: message },
      };
    } else if (exception instanceof RpcException) {
      return {
        status: HttpStatus.BAD_GATEWAY,
        message:
          exception.getError()?.['response']?.['message'] ||
          exception.getError(),
        errorCode: 'RPC_ERROR',
        additionalDetails: { cause: 'Error in microservice communication' },
      };
    } else if (exception.constructor.name === 'PrismaClientKnownRequestError') {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `Database error: ${(exception as Error).message.replace(/\n/g, '')}`,
        errorCode: 'PRISMA_CLIENT_KNOWN_REQUEST_ERROR',
        additionalDetails: { prismaCode: (exception as { code: string }).code },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unexpected error',
      errorCode: 'INTERNAL_SERVER_ERROR',
      additionalDetails: exception,
    };
  }

  private logError(
    exception: unknown,
    status: HttpStatus,
    message: string | object,
    errorCode: string,
    context: any, // Обобщенное название для контекста
    additionalDetails: any,
  ): void {
    this.logger.error({
      message: `Exception thrown: ${message}`,
      statusCode: status,
      errorCode,
      url: context.url || 'N/A',
      method: context.method || 'N/A',
      exceptionType: exception.constructor.name,
      additionalDetails,
      stack: (exception as Error)?.stack,
      cause: (exception as { cause?: any })?.cause,
    });
  }
}
