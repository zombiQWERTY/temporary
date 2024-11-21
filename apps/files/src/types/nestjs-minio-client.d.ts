declare module 'nestjs-minio-client' {
  import {
    ModuleMetadata,
    Type,
    DynamicModule,
    Injectable,
  } from '@nestjs/common';
  import * as Minio from 'minio';

  export interface MinioOptions {
    endPoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
  }

  export interface MinioOptionsFactory {
    createMinioOptions(): Promise<MinioOptions> | MinioOptions;
  }

  export interface MinioModuleAsyncOptions
    extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<MinioOptionsFactory>;
    useClass?: Type<MinioOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<MinioOptions> | MinioOptions;
    inject?: any[];
  }

  export class MinioModule {
    static register(options: MinioOptions): DynamicModule;
    static registerAsync(options: MinioModuleAsyncOptions): DynamicModule;
  }

  @Injectable()
  export class MinioService {
    client: Minio.Client;
  }
}
