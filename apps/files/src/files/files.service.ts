import { Inject, Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import * as sharp from 'sharp';
import axios from 'axios';
import { ConfigType } from '@nestjs/config';
import { MinioService } from 'nestjs-minio-client';
import { promises as fs } from 'node:fs';
import { join, relative } from 'node:path';

import { Folder, makeKey, s3 } from '../config/multer.options';
import { PrismaService } from '../services/prisma.service';
import { minioConfig } from '../config/minio.config';
import { Prisma, UploadedFile } from '../../prisma/client';
import { appConfig } from '../config/app.config';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  private readonly splashFileName = 'splash.png';
  private readonly splashFileUrl: string;
  private readonly minioSyncFolderName = 'minioSyncFolder';

  private readonly minioSyncFolder = join(
    __dirname,
    '../..',
    `resources/${this.minioSyncFolderName}`,
  );

  constructor(
    private prisma: PrismaService,
    @Inject(minioConfig.KEY)
    private config: ConfigType<typeof minioConfig>,
    @Inject(appConfig.KEY)
    private appConfigVars: ConfigType<typeof appConfig>,
    private readonly minioService: MinioService,
  ) {
    this.splashFileUrl = `${this.config.publicUrl}/${this.config.bucketName}/${this.minioSyncFolderName}/${this.splashFileName}`;

    if (appConfigVars.node_env !== 'test') {
      this.initBucket();
    }
  }

  async syncFilesToMinio(): Promise<void> {
    try {
      await this.uploadDirectory(this.minioSyncFolder);
    } catch (error) {
      this.logger.error(
        'An error occurred while syncing files to MinIO:',
        error,
      );
    }
  }

  private async uploadDirectory(
    directoryPath: string,
    basePath: string = this.minioSyncFolder,
  ): Promise<void> {
    try {
      const directoryEntries = await fs.readdir(directoryPath, {
        withFileTypes: true,
      });

      for (const entry of directoryEntries) {
        const fullPath = join(directoryPath, entry.name);
        const relativePath = relative(basePath, fullPath);

        if (entry.isDirectory()) {
          await this.uploadDirectory(fullPath, basePath);
        } else if (entry.isFile()) {
          await this.uploadFileToMinio(relativePath, fullPath);
        }
      }
    } catch (error) {
      this.logger.error(
        `An error occurred while uploading directory: ${directoryPath}`,
        error,
      );
    }
  }

  private async uploadFileToMinio(
    objectName: string,
    filePath: string,
  ): Promise<void> {
    try {
      await this.minioService.client.statObject(
        this.config.bucketName,
        objectName,
      );
    } catch (e) {
      if (e.code === 'NotFound') {
        const fileBuffer = await fs.readFile(filePath);
        await this.minioService.client.putObject(
          this.config.bucketName,
          `${this.minioSyncFolderName}/${objectName}`,
          fileBuffer,
        );
      } else {
        this.logger.error(`Error checking file in MinIO: "${objectName}"`, e);
      }
    }
  }

  async initBucket() {
    const bucketExists = await this.minioService.client.bucketExists(
      this.config.bucketName,
    );

    if (!bucketExists) {
      await this.minioService.client.makeBucket(this.config.bucketName);
    }

    await this.minioService.client.setBucketPolicy(
      this.config.bucketName,
      JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              AWS: ['*'],
            },
            Action: ['s3:GetBucketLocation', 's3:ListBucket'],
            Resource: [`arn:aws:s3:::${this.config.bucketName}`],
          },
          {
            Effect: 'Allow',
            Principal: {
              AWS: ['*'],
            },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.config.bucketName}/*`],
          },
        ],
      }),
    );

    await this.syncFilesToMinio();
  }

  async putFiles(params: {
    userId: number;
    tags: string[];
    files: Express.MulterS3.File[];
  }): Promise<Array<Pick<UploadedFile, 'id' | 'url' | 'thumbnailUrl'>>> {
    if (!params.files?.length) {
      return [];
    }

    const preparedFiles = await Promise.all(this.prepareFiles(params));

    const res = await this.prisma.$transaction(
      preparedFiles.map((file) =>
        this.prisma.uploadedFile.create({ data: file }),
      ),
    );

    return res.map((f) => ({
      url: f.url,
      thumbnailUrl: f.thumbnailUrl || this.splashFileUrl,
      id: f.id,
      fileName: f.name,
      size: f.size,
      mimeType: f.mimeType,
    }));
  }

  prepareFiles(params: {
    userId: number;
    tags: string[];
    files: Express.MulterS3.File[];
  }): Promise<Prisma.UploadedFileCreateManyInput>[] {
    return params.files.map(async (file) => {
      const thumbnailUrl = await this.uploadThumbnail(params.userId, file);

      return {
        url: `${this.config.publicUrl}/${file.bucket}/${file.key}`,
        name: file.originalname,
        path: file.key,
        userId: params.userId,
        size: file.size,
        checksum: file.etag,
        mimeType: file.mimetype,
        tags: params.tags,
        thumbnailUrl,
        version: 1,
      };
    });
  }

  prepareRaw({
    folder = 'thumbnails',
    ...params
  }: {
    userId: number;
    tags: string[];
    url: string;
    buffer: Buffer;
    folder?: Folder;
    file: {
      originalname: string;
      etag: string;
      mimetype: string;
    };
  }): Prisma.UploadedFileCreateInput {
    const path = makeKey(params.userId, params.file.originalname, folder);

    return {
      url: params.url,
      name: params.file.originalname,
      path,
      userId: params.userId,
      size: params.buffer.length,
      checksum: params.file.etag,
      mimeType: params.file.mimetype,
      tags: params.tags,
      version: 1,
    };
  }

  async saveRaw(file: Prisma.UploadedFileCreateInput) {
    const f = await this.prisma.uploadedFile.create({ data: file });

    return { id: f.id, url: f.url };
  }

  async downloadFileToBuffer(url: string): Promise<Buffer> {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  }

  async uploadThumbnail(
    userId: number,
    file: Express.MulterS3.File,
  ): Promise<string> {
    if (!file.mimetype.startsWith('image/')) {
      return null;
    }

    const filename = makeKey(userId, file.originalname, 'thumbnails');

    const fileBuffer = await this.downloadFileToBuffer(file.location);

    const buffer = await sharp(fileBuffer)
      .resize({
        fit: sharp.fit.outside,
        width: 200,
        height: 200,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    return this.uploadBuffer(filename, buffer, 'image/jpeg');
  }

  async uploadBuffer(filename: string, buffer: Buffer, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await s3.send(command);
    return `${this.config.publicUrl}/${this.config.bucketName}/${filename}`;
  }

  getFilesUrls(filesIds: number[]) {
    return this.prisma.uploadedFile.findMany({
      select: {
        id: true,
        url: true,
        name: true,
        size: true,
        thumbnailUrl: true,
        mimeType: true,
      },
      where: {
        id: { in: filesIds },
      },
    });
  }
}
