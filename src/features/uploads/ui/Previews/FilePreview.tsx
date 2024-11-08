import { Box, Stack, Typography } from '@mui/material';
import { memo } from 'react';
import { FieldErrors } from 'react-hook-form';

import {
  UploadedFileStateEnum,
  InternalFileSchema,
  FilesUploadProgress,
} from '../../model/types';
import { DisplayFile } from './DisplayFile';
import { LoadingFile } from './LoadingFile';

interface FilePreviewProps {
  file: InternalFileSchema;
  index: number;
  loadingProgress?: FilesUploadProgress | null;
  disabled?: boolean;
  canDelete?: boolean;
  handleRemove?: (id: string, index: number) => void;
  handleUpdate?: (id: string) => void;
  errors?: FieldErrors<Array<{ [field: string]: { message: string } }>>;
}

export const FilePreview = memo(
  ({
    file,
    index,
    loadingProgress,
    disabled,
    canDelete,
    handleRemove,
    handleUpdate,
    errors,
  }: FilePreviewProps) => {
    return (
      <Stack key={file.internalId}>
        <Box
          display="flex"
          sx={{
            border: 1,
            borderRadius: 2,
            borderColor: errors?.[index]?.state ? 'error.main' : 'grey.100',
            backgroundColor: 'common.white',
            paddingX: 4,
            paddingY: 2,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: disabled ? 0.65 : 1,
          }}
        >
          {file.state === UploadedFileStateEnum.Loading ? (
            <LoadingFile file={file} loadingProgress={loadingProgress} />
          ) : (
            <DisplayFile
              file={file}
              disabled={disabled}
              canDelete={canDelete}
              handleRemove={handleRemove}
              handleUpdate={handleUpdate}
              index={index}
            />
          )}
        </Box>
        {errors?.[index]?.state && (
          <Typography
            variant="CaptionRegular"
            color="error"
            sx={{ ml: '5px', mt: '5px' }}
          >
            {String(errors[index].state.message)}
          </Typography>
        )}
      </Stack>
    );
  },
);

FilePreview.displayName = 'FilePreview';
