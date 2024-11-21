import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { createHash } from 'crypto';

@Injectable()
export class DocumentService {
  constructor() {}

  async generateDocx(
    assetName: string,
    fileName: string,
    data: Record<string, any>,
  ) {
    const templatePath = path.resolve(
      '/usr/src/app/dist/resources/',
      `${assetName}.docx`,
    );

    const filledDocxBuffer = await this.fillDocxVariablesFs(templatePath, data);

    const fileMetadata = this.generateFileMetadata(fileName, filledDocxBuffer);

    return { filledDocxBuffer, fileMetadata };
  }

  private generateFileMetadata(originalname: string, buffer: Buffer) {
    const etag = createHash('md5').update(buffer).digest('hex');
    const mimetype =
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return {
      originalname,
      etag,
      mimetype,
    };
  }

  private async fillDocxVariablesFs(
    file: string,
    values: Record<string, string | number>,
  ): Promise<Buffer> {
    const content = await fs.readFile(file, 'binary');
    return this.fillDocxVariables(content, values);
  }

  async fillDocxVariables(
    content: Buffer | string,
    values: Record<string, string | number>,
  ): Promise<Buffer> {
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      linebreaks: true,
      paragraphLoop: true,
    });

    doc.render(values);

    return doc.getZip().generate({
      compression: 'DEFLATE',
      type: 'nodebuffer',
    });
  }
}
