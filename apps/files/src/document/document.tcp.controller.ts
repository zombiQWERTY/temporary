import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { MakeDocumentRequestDto } from './request-dto/makeDocumentRequest.dto';
import { DocumentService } from './document.service';
import { FilesService } from '../files/files.service';
import { makeKey } from '../config/multer.options';

@Controller()
export class DocumentTcpController {
  constructor(
    private readonly filesService: FilesService,
    private readonly documentService: DocumentService,
  ) {}

  @MessagePattern({ cmd: 'make_document' })
  async makeDocument(
    dto: MakeDocumentRequestDto,
  ): Promise<{ id: number; url: string }> {
    const { filledDocxBuffer, fileMetadata } =
      await this.documentService.generateDocx(
        dto.assetName,
        dto.fileName,
        dto.data,
      );

    const filename = makeKey(
      dto.userId,
      fileMetadata.originalname,
      'documents',
    );

    const url = await this.filesService.uploadBuffer(
      filename,
      filledDocxBuffer,
      fileMetadata.mimetype,
    );

    const prepared = this.filesService.prepareRaw({
      file: fileMetadata,
      tags: ['document', String(dto.userId), dto.assetName],
      buffer: filledDocxBuffer,
      userId: dto.userId,
      folder: 'documents',
      url,
    });

    return this.filesService.saveRaw(prepared);
  }
}
