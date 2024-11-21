import { Controller } from '@nestjs/common';

import { FilesService } from './files.service';
import { MessagePattern } from '@nestjs/microservices';
import { GetFilesUrlsRequestDto } from './request-dto/getFilesUrlsRequest.dto';

@Controller()
export class FilesTcpController {
  constructor(private readonly filesService: FilesService) {}

  @MessagePattern({ cmd: 'get_files_urls' })
  getFilesUrls(dto: GetFilesUrlsRequestDto): Promise<
    {
      id: number;
      url: string;
      thumbnailUrl: string;
      name: string;
      size: number;
      mimeType: string;
    }[]
  > {
    return this.filesService.getFilesUrls(dto.fileIds.filter(Boolean));
  }
}
