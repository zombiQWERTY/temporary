import { LoggerService } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { GlobalExceptionsFilter } from '@erp-modul/shared';

const mockLogger = {
  error: jest.fn(),
} as unknown as LoggerService;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
};

const mockRequest = {
  url: '/test-path',
  method: 'POST',
};

describe('GlobalExceptionsFilter', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle HttpException and respond with the appropriate status and message', () => {
    const exceptionFilter = new GlobalExceptionsFilter(mockLogger);
    const host = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
      getType: () => 'http',
    } as any;

    const error = { message: 'Not Found', status: 404 };
    const exception = new HttpException(error, HttpStatus.NOT_FOUND);

    exceptionFilter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 404,
      timestamp: expect.any(String),
      path: mockRequest.url,
      method: mockRequest.method,
      message: 'Not Found',
      errorCode: 'HTTP_EXCEPTION',
      additionalDetails: { details: 'Not Found' },
    });
    expect(mockLogger.error).toHaveBeenCalledWith({
      message: `Exception thrown: Not Found`,
      statusCode: 404,
      errorCode: 'HTTP_EXCEPTION',
      url: mockRequest.url,
      method: mockRequest.method,
      exceptionType: 'HttpException',
      additionalDetails: { details: 'Not Found' },
      stack: exception.stack,
    });
  });

  it('should handle RpcException and respond with BAD_GATEWAY status', () => {
    const exceptionFilter = new GlobalExceptionsFilter(mockLogger);
    const host = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
      getType: () => 'http',
    } as any;

    const error = { message: 'Service Failure', status: 502 };
    const exception = new RpcException({ response: error, status: 502 });

    exceptionFilter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(502);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 502,
      timestamp: expect.any(String),
      path: mockRequest.url,
      method: mockRequest.method,
      message: 'Service Failure',
      errorCode: 'RPC_ERROR',
      additionalDetails: { cause: 'Error in microservice communication' },
    });
    expect(mockLogger.error).toHaveBeenCalledWith({
      message: `Exception thrown: Service Failure`,
      statusCode: 502,
      errorCode: 'RPC_ERROR',
      url: mockRequest.url,
      method: mockRequest.method,
      exceptionType: 'RpcException',
      additionalDetails: { cause: 'Error in microservice communication' },
      stack: exception.stack,
    });
  });

  it('should handle generic Error and respond with INTERNAL_SERVER_ERROR', () => {
    const exceptionFilter = new GlobalExceptionsFilter(mockLogger);
    const host = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
      getType: () => 'http',
    } as any;

    const error = new Error('Unexpected Error');
    const exception = {
      message: 'Unexpected Error',
      constructor: {
        name: 'Error',
      },
      stack: error.stack,
    };

    exceptionFilter.catch(exception as any, host);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
      path: mockRequest.url,
      method: mockRequest.method,
      message: 'Unexpected error',
      errorCode: 'INTERNAL_SERVER_ERROR',
      additionalDetails: exception,
    });
    expect(mockLogger.error).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Exception thrown: Unexpected error`,
      errorCode: 'INTERNAL_SERVER_ERROR',
      url: mockRequest.url,
      method: mockRequest.method,
      exceptionType: 'Error',
      additionalDetails: exception,
      stack: exception.stack,
    });
  });
});
