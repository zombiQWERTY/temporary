import { Stack } from '@mui/material';
import { memo } from 'react';
import { FieldErrors } from 'react-hook-form';

import { InternalFileSchema, FilesUploadProgress } from '../../model/types';
import { FilePreview } from './FilePreview';

interface PreviewsProps {
  files: InternalFileSchema[];
  loadingProgress?: FilesUploadProgress | null;
  canDelete?: boolean;
  disabled?: boolean;
  onRemove?: (id: string, index: number) => void;
  onUpdate?: (id: string) => void;
  errors?: FieldErrors<Array<{ [field: string]: { message: string } }>>;
}

export const Previews = memo(
  ({
    files,
    disabled,
    onRemove,
    onUpdate,
    canDelete = false,
    loadingProgress,
    errors,
  }: PreviewsProps) => {
    return (
      <Stack gap={4}>
        {files.map((file, index) => (
          <FilePreview
            key={file.internalId}
            file={file}
            index={index}
            loadingProgress={loadingProgress}
            disabled={disabled}
            canDelete={canDelete}
            handleRemove={onRemove}
            handleUpdate={onUpdate}
            errors={errors}
          />
        ))}
      </Stack>
    );
  },
);

Previews.displayName = 'Previews';
