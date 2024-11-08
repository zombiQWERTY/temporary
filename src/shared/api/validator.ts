import { z } from 'zod';

interface ValidateConfig<T extends z.ZodTypeAny> {
  dto: unknown;
  schema: T;
  schemaName: string;
  isRequest?: boolean;
  isResponse?: boolean;
}

export function validateSchema<T extends z.ZodTypeAny>(
  config: ValidateConfig<T>,
): z.infer<T> {
  const { schema, dto, schemaName, isResponse, isRequest } = config;
  const parsedResult = schema.safeParse(dto);

  if (parsedResult.success) {
    return parsedResult.data;
  }

  logValidationError(
    schemaName,
    { isResponse, isRequest },
    dto,
    parsedResult.error,
  );

  // @TODO: Uncomment the line below and test on staging when the project is stable
  // throw parsedResult.error;

  return dto as z.infer<T>;
}

const logValidationError = (
  schemaName: string,
  errorGroup: { isResponse?: boolean; isRequest?: boolean },
  dto: unknown,
  error: z.ZodError,
): void => {
  const errorDetails = {
    dto,
    error: error.message,
    issues: error.issues,
  };

  const requestGroup = errorGroup.isRequest ? 'Request:' : null;
  const responseGroup = errorGroup.isResponse ? 'Response:' : null;

  captureError(
    `API Validation Error: ${[requestGroup || responseGroup, schemaName].filter(Boolean).join(' ')}`,
    errorDetails,
  );

  // @TODO: install Sentry through wizard: npx @sentry/wizard@latest -i nextjs
  // if (typeof window !== 'undefined') {
  //   Sentry.captureException(new Error(`API Validation Error: ${schemaName}`), {
  //     extra: errorDetails,
  //   });
  // } else {
  //   SentryNode.captureException(
  //     new Error(`API Validation Error: ${schemaName}`),
  //     {
  //       extra: errorDetails,
  //     },
  //   );
  // }
};

const captureError = (
  message: string,
  extra: Record<string, any> = {},
): void => {
  if (typeof window !== 'undefined') {
    console.error(message, extra);
  } else {
    console.log(message);
    console.dir(extra, { depth: 100 });
  }
};
