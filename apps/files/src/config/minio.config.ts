import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const minioConfigSchema = z.object({
  accessKey: z.string(),
  secretKey: z.string(),
  bucketName: z.string(),
  endpoint: z.string(),
  port: z.number(),
  useSSL: z.boolean(),
  maxFileSize: z.number(),
  url: z.string(),
  publicUrl: z.string(),
});

const configObj = {
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
  bucketName: process.env.MINIO_PUBLIC_BUCKET,
  endpoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_API_PORT, 10) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB, 10) * 1024 * 1024,
  url: `http${process.env.MINIO_USE_SSL === 'true' ? 's' : ''}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_API_PORT}`,
  publicUrl: process.env.MINIO_PUBLIC_URL,
};

export const config = minioConfigSchema.parse(configObj);

export const minioConfig = registerAs('MINIO', () => {
  return config;
});
