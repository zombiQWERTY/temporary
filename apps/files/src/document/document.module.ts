import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentTcpController } from './document.tcp.controller';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [DocumentTcpController],
  providers: [DocumentService],
})
export class DocumentModule {}
