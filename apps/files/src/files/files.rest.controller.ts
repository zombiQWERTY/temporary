import {
  Body,
  Controller,
  Inject,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ConfigType } from '@nestjs/config';

import { FilesService } from './files.service';
import { getMulterOptions } from '../config/multer.options';
import { GetMetaParams, UserMetadataParams } from '@erp-modul/shared';
import { minioConfig } from '../config/minio.config';

@Controller('upload')
export class FilesRestController {
  constructor(
    private readonly filesService: FilesService,
    @Inject(minioConfig.KEY)
    private config: ConfigType<typeof minioConfig>,
  ) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor(
      'files',
      5,
      getMulterOptions({
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      }),
    ),
  )
  async putFiles(
    @Body() dto: { tags?: string[] },
    @GetMetaParams() meta: UserMetadataParams,
    @UploadedFiles() files: Express.MulterS3.File[],
  ) {
    // @TODO: Don't know why but file.location does not have port. But port must be there (tested in another project)
    const addPort = (url: string): string => {
      const parsedUrl = new URL(url);
      return `${parsedUrl.protocol}//${parsedUrl.hostname}:${this.config.port}${parsedUrl.pathname}`;
    };

    const result = await this.filesService.putFiles({
      userId: meta.userId,
      tags: dto.tags,
      files: files.map((f) => ({
        ...f,
        size:
          parseInt(String(f.size), 10) ||
          parseInt(String(f.metadata.size), 10) ||
          0,
        originalname: Buffer.from(f.originalname, 'latin1').toString('utf-8'),
        location: addPort(f.location),
      })),
    });

    return { files: result, fileIds: result.map((f) => f.id) };
  }
}
