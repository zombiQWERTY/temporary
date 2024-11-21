import { extname } from 'path';
import * as multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import * as querystring from 'node:querystring';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

import { config as minioConfig } from './minio.config';
import { fileFilter } from '../filters/file.filter';

export type Folder = 'uploads' | 'thumbnails' | 'documents';

export const makeKey = (
  userId: number,
  originalName: string,
  folder: Folder = 'uploads',
) => `${folder}/${userId}/${Date.now()}${extname(originalName)}`;

interface MulterOptionsProps {
  allowedTypes: string[];
  maxFileSize?: number;
}

export const s3 = new S3Client({
  forcePathStyle: true,
  endpoint: minioConfig.url,
  region: 'any-region',
  credentials: {
    accessKeyId: minioConfig.accessKey,
    secretAccessKey: minioConfig.secretKey,
  },
});

export const getMulterOptions = ({
  allowedTypes,
  maxFileSize = minioConfig.maxFileSize,
}: MulterOptionsProps): MulterOptions => ({
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter: fileFilter(allowedTypes),
  storage: multerS3({
    s3,
    bucket: minioConfig.bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    cacheControl: 'max-age=31536000',
    acl: 'public-read',
    metadata(
      req: Express.Request & Request,
      file: Express.Multer.File,
      cb: (error: any, metadata?: any) => void,
    ) {
      const fileSize = parseInt(req.headers?.['content-length']) || 0;

      cb(null, {
        originalName: querystring.escape(file.originalname),
        mimetype: file.mimetype,
        size: String(file.size || fileSize),
      });
    },
    key: function (request: Express.Request & Request, file, cb) {
      const userId = request.headers['x-user-id'];
      cb(null, makeKey(userId, file.originalname));
    },
  }),
});
