export interface DynamicErrorResponse {
  [key: string]: {
    http_status_code: number;
    http_body: string;
    http_body_encoding: string;
  };
}

export interface ErrorDetails {
  serviceName: string;
  httpStatusCode: number;
  path: string;
  method: string;
  message: string;
  errorCode: string;
  timestamp: string;
  additionalDetails: {
    details: string;
    message?: string | string[];
  };
}

export interface ServerError {
  error: string;
  errorList: ErrorDetails[];
}

const parseErrorBody = (httpBody: string) => {
  try {
    return JSON.parse(httpBody) as {
      path: string;
      method: string;
      message: string | string[];
      errorCode: string;
      timestamp: string;
      additionalDetails: {
        details: string;
        message?: string | string[];
      };
    };
  } catch (error) {
    console.error(`Failed to parse error body:`, error);
    return null;
  }
};

export const extractAllErrorDetails = (
  response: DynamicErrorResponse,
): ErrorDetails[] => {
  if (!response) {
    return [];
  }

  return Object.keys(response)
    .filter((key) => key.startsWith('error_') && key.endsWith('_service'))
    .map((key) => {
      const { http_status_code, http_body } = response[key];
      const parsedBody = parseErrorBody(http_body);

      if (!parsedBody) {
        return null;
      }

      return {
        serviceName: key,
        httpStatusCode: http_status_code,
        path: parsedBody.path,
        method: parsedBody.method,
        message: Array.isArray(parsedBody.message)
          ? parsedBody.message.join(', ')
          : parsedBody.message,
        errorCode: parsedBody.errorCode,
        timestamp: parsedBody.timestamp,
        additionalDetails: parsedBody.additionalDetails,
      } as ErrorDetails;
    })
    .filter((details): details is ErrorDetails => details !== null);
};
