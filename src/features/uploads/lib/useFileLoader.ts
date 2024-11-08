'use client';

import { AxiosProgressEvent } from 'axios';
import { assoc } from 'ramda';
import { useCallback, useEffect, useState } from 'react';
import {
  FieldArrayWithId,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

import {
  FilesUploadProgress,
  UploadedFileStateEnum,
  InternalFileSchema,
} from '../model/types';

interface BaseFileMeta {
  fileId: number; // id in file entity in database
  fileName: string;
  mimeType: string;
  size: number;
  thumbnailUrl: string | null;
}

const axiosProgressToPercent = (progress?: number) =>
  progress ? Number((progress * 100).toFixed(2)) : 0;

export const fileMappers = {
  fromUploaded: (file: File): InternalFileSchema => ({
    internalId: uuidv4(),
    externalId: null,
    mimeType: file.type,
    name: file.name,
    size: file.size,
    freshlyAddedFile: file,
    thumbnailUrl: '',
    state: UploadedFileStateEnum.Loading,
    isNewFile: true,
  }),
  fromServer: (file: BaseFileMeta, isNewFile = false): InternalFileSchema => ({
    internalId: uuidv4(),
    externalId: file.fileId,
    name: file.fileName,
    mimeType: file.mimeType,
    size: file.size,
    thumbnailUrl: file.thumbnailUrl,
    state: UploadedFileStateEnum.Success,
    isNewFile,
  }),
  fromUploaderToForm: (files: InternalFileSchema[]): number[] =>
    files
      .filter((f) => f.isNewFile)
      .map((f) => f.externalId)
      .filter(Boolean),
};

const sortByStatusUploadedFiles = (
  settledData: PromiseSettledResult<Awaited<InternalFileSchema[]>>[],
  sourceData: Awaited<InternalFileSchema>[],
) => {
  return settledData.reduce<{
    successResult: InternalFileSchema[];
    errorResult: InternalFileSchema[];
  }>(
    (acc, res, index) => {
      return {
        successResult:
          res.status === 'rejected'
            ? acc.successResult
            : [...acc.successResult, res.value[0]],
        errorResult:
          res.status === 'rejected'
            ? [...acc.errorResult, sourceData[index]]
            : acc.errorResult,
      };
    },
    {
      successResult: [],
      errorResult: [],
    },
  );
};

type OnUploadProgress = (
  internalId: string,
) => (progressEvent: AxiosProgressEvent) => void;

export type UploadsHandler = (x: {
  files: { internalId: string; file: File }[];
  onUploadProgress: OnUploadProgress;
}) => Promise<InternalFileSchema[]>;

interface UseFileLoaderProps {
  name: string;
  uploadHandler: UploadsHandler;
}

interface UseFileLoaderReturnType {
  onAddFiles: (changedFiles: Array<File>) => void;
  onRemove: (id: string, index: number) => void;
  files: FieldArrayWithId<
    { [x: string]: InternalFileSchema[] },
    string,
    'key'
  >[];
  filesUploadProgress: FilesUploadProgress | null;
}

enum UploadingProcessEnum {
  InProcess = 'inProcess',
  Waiting = 'waiting',
}

export const useFileLoader = ({
  name,
  uploadHandler,
}: UseFileLoaderProps): UseFileLoaderReturnType => {
  const [uploadingStatus, setUploadingStatus] = useState(
    UploadingProcessEnum.Waiting,
  );

  const [rejectedFile, setRejectedFile] = useState<InternalFileSchema>();

  const [loadingProgress, setLoadingProgress] =
    useState<FilesUploadProgress | null>(null);

  const { control } = useFormContext<{
    [x: typeof name]: InternalFileSchema[];
  }>();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name,
    keyName: 'key' as const,
  });

  const onUploadProgress =
    (internalId: string) => (progressEvent: AxiosProgressEvent) => {
      setLoadingProgress(
        assoc(internalId, axiosProgressToPercent(progressEvent.progress)),
      );
    };

  const onRemove = (_id: string, index: number) => remove(index);

  const startUpload = useCallback(
    async (selectedFiles: Array<File>) => {
      setUploadingStatus(UploadingProcessEnum.InProcess);

      const filesToUpload = selectedFiles.map(fileMappers.fromUploaded);
      append(filesToUpload);

      /**
       * @description Файлы на сервер отправляются по одному, для возможности
       * отслеживания прогресса загрузки
       */
      const promisedUploadData = filesToUpload.map((file) =>
        uploadHandler({
          files: [
            { internalId: file.internalId, file: file.freshlyAddedFile! },
          ],
          onUploadProgress,
        }),
      );

      const data = await Promise.allSettled(promisedUploadData);

      setLoadingProgress(null);

      const { errorResult, successResult } = sortByStatusUploadedFiles(
        data,
        filesToUpload,
      );

      if (errorResult.length) {
        /**
         * @description На каждый сет ошибки, работает обработчик в useEffect, который меняет
         * статус незагруженного файла в "error".
         * @TODO: При необходимости можно сохранять сообщение с ошибкой и показывать пользователю.
         */
        errorResult.forEach((rejectedFile) => setRejectedFile(rejectedFile));
      }

      append(successResult);

      /**
       * @description setUploadingStatus(UploadingProcessEnum.Waiting) Вызывает подписку в useEffect,
       * которая очистит временные файлы со статусом "loading" из формы
       */
      setUploadingStatus(UploadingProcessEnum.Waiting);
    },
    [
      append,
      uploadHandler,
      setLoadingProgress,
      setUploadingStatus,
      setRejectedFile,
    ],
  );

  const onUploadingStatusChange = () => {
    /**
     * @description Удаление временных файлов происходит в момент завершения загрузки этих файлов
     * на сервер при помощи триггера setUploadingStatus(false).
     * Удаленные файлы заменяются обновленными копиями с сервера при помощи append(successResult);
     */
    if (uploadingStatus === UploadingProcessEnum.Waiting && fields.length) {
      const loadings = fields
        .map((field, index) => {
          /**
           * @description Исключение возникновения race condition, при котором удалится файл
           * параллельно которому меняется статус на "error"
           */
          return field.state === UploadedFileStateEnum.Loading &&
            rejectedFile?.internalId !== field.internalId
            ? index
            : null;
        })
        .filter((index) => index !== null);

      remove(loadings);
    }
  };

  const onRejectedFileAppear = () => {
    if (uploadingStatus === UploadingProcessEnum.Waiting && rejectedFile) {
      const failedFileId = rejectedFile.internalId;

      const failedFileIndex = fields.findIndex(
        (field: InternalFileSchema) => field.internalId === failedFileId,
      );

      if (failedFileIndex + 1) {
        update(
          failedFileIndex,
          assoc('state', UploadedFileStateEnum.Error, fields[failedFileIndex]),
        );
      }
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(onUploadingStatusChange, [uploadingStatus]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(onRejectedFileAppear, [rejectedFile]);

  return {
    onAddFiles: startUpload,
    onRemove,
    files: fields,
    filesUploadProgress: loadingProgress,
  };
};
