import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const MinioConfigSchema = z.object({
  bucketName: z.string(),
  publicUrl: z.string(),
});

export const minioConfig = registerAs('MINIO', () => {
  const minioConfig = {
    bucketName: process.env.MINIO_PUBLIC_BUCKET,
    publicUrl: process.env.MINIO_PUBLIC_URL,
  };

  return MinioConfigSchema.parse(minioConfig);
});

export type MinioConfigSchemaType = z.infer<typeof MinioConfigSchema>;
