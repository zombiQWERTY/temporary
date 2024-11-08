import { z } from 'zod';
import { validateSchema } from '@/shared/api/validator';

export const validateResponse = async <Res extends z.ZodTypeAny>(
  res: z.infer<Res>,
  schema: Res,
  url: string,
): Promise<z.infer<Res>> => {
  return validateSchema({
    dto: res,
    schema,
    schemaName: url,
  });
};

export const prepareRequestBody = <Req extends z.ZodTypeAny>(
  body: { dto: z.infer<Req>; schema: Req } | undefined,
  url: string,
): z.infer<Req> | undefined => {
  return body
    ? validateSchema({
        dto: body.dto,
        schema: body.schema,
        schemaName: url,
      })
    : undefined;
};
