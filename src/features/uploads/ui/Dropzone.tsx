'use client';

import { Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { useTranslations } from 'next-intl';
import { Accept, useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';

import { FileUploadIcon } from '@/shared/ui';
import {
  InternalFileSchema,
  FilesUploadProgress,
  MimeTypesEnum,
} from '../model/types';
import { Previews } from './Previews';

interface DropzoneProps {
  canDelete?: boolean;
  disabled?: boolean;
  maxSize?: number;
  acceptTypes?: Accept;
  multiple?: boolean;
  name: string;
  onDrop: (acceptedFiles: File[]) => void;
  onRemove: (id: string, index: number) => void;
  files: InternalFileSchema[];
  filesUploadProgress: FilesUploadProgress | null;
}

export const Dropzone = ({
  canDelete = false,
  disabled = false,
  maxSize = 15 * 1024 * 1024,
  acceptTypes = {
    [MimeTypesEnum.IMAGE_ALL]: [],
    [MimeTypesEnum.VIDEO_ALL]: [],
  },
  multiple = false,
  name,
  onDrop,
  onRemove,
  files,
  filesUploadProgress,
  ...props
}: DropzoneProps) => {
  const t = useTranslations('Shared.Fields.DnD');

  const {
    register,
    formState: { errors },
  } = useFormContext<{ [x: typeof name]: InternalFileSchema[] }>();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptTypes,
    maxSize,
    onDrop,
    multiple,
    ...props,
    ...register(name),
  });

  const hasFiles = Boolean(files && files.length);

  return (
    <>
      <Box
        sx={{
          mb: hasFiles ? 6 : 0,
          border: isDragActive ? 2 : 1,
          borderRadius: 2,
          opacity: disabled ? 0.65 : 1,
          borderStyle: 'dashed',
          borderColor: isDragActive
            ? 'primary.main'
            : errors[name]
              ? 'error.main'
              : 'grey.100',
          backgroundColor: isDragActive ? 'secondary.main' : 'common.white',
        }}
      >
        <Stack
          direction="column"
          alignItems="center"
          py={10}
          gap={4}
          {...getRootProps()}
        >
          <input {...getInputProps()} />

          <Stack color={isDragActive ? 'primary.main' : 'grey.300'} mb={4}>
            <FileUploadIcon color="inherit" fontSize="extraLarge" />
          </Stack>

          <span>
            <Typography variant="BodyMRegilar">
              {t('drag_your_files_or')}
            </Typography>

            <Typography variant="BodyMRegilar" color="primary">
              {' '}
              {t('highlighted')}
            </Typography>
          </span>

          <Typography variant="FootnoteRegular" color="grey.400">
            {t('formats')}
          </Typography>
        </Stack>
      </Box>
      {errors[name] && errors[name] && (
        <Typography key="errorField" variant="CaptionRegular" color="error">
          {errors[name].message}
        </Typography>
      )}

      {hasFiles && (
        <Previews
          loadingProgress={filesUploadProgress}
          files={files}
          canDelete={canDelete}
          onRemove={onRemove}
          disabled={disabled}
          errors={Array.isArray(errors[name]) ? errors[name] : []}
        />
      )}
    </>
  );
};
