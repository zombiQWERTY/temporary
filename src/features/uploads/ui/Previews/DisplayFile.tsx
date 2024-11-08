import { Box, IconButton, Stack, Typography, Chip } from '@mui/material';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { TrashEmptyIcon, RedoIcon } from '@/shared/ui';
import { formatBytes } from '../../lib/formatBytes';
import { UploadedFileStateEnum, InternalFileSchema } from '../../model/types';

const splashImageUrl = process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL || '';

interface DisplayFileProps {
  file: InternalFileSchema;
  disabled?: boolean;
  canDelete?: boolean;
  handleRemove?: (id: string, index: number) => void;
  handleUpdate?: (id: string) => void;
  index: number;
}

export const DisplayFile = ({
  file,
  disabled,
  canDelete,
  handleRemove,
  handleUpdate,
  index,
}: DisplayFileProps) => {
  const t = useTranslations('Shared.Fields.DnD.Previews');

  return (
    <>
      <Stack flexDirection="row" gap={4} width="90%">
        <Box
          display="flex"
          sx={{
            width: '52px',
            height: '52px',
            borderRadius: 1,
            overflow: 'hidden',
            border: '1px solid #DCDEE0',
          }}
        >
          <Image
            alt={file.name}
            src={
              file.state === 'success'
                ? file.thumbnailUrl || splashImageUrl
                : splashImageUrl
            }
            width={52}
            height={52}
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>

        <Stack gap={1} width="80%">
          <Typography
            component="div"
            variant="BodySRegular"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {file.name}
          </Typography>

          <Stack direction="row" alignItems="center" gap={3}>
            <Typography variant="BodySRegular" color="grey.300" width="75px">
              {file.size ? formatBytes(file.size) : null}
            </Typography>

            <Chip
              label={
                file.state === 'success'
                  ? t('upload_success')
                  : t('upload_error')
              }
              color={file.state === 'success' ? 'success' : 'error'}
              size="small"
            />
          </Stack>
        </Stack>
      </Stack>

      <Stack direction="row" gap={1}>
        {file.state === UploadedFileStateEnum.Error && handleUpdate && (
          <IconButton
            size="large"
            disabled={disabled}
            onClick={() => handleUpdate(file.internalId)}
          >
            <RedoIcon />
          </IconButton>
        )}

        {(canDelete || file.isNewFile) && handleRemove && (
          <IconButton
            size="large"
            onClick={() => handleRemove(file.internalId, index)}
            color="error"
            disabled={disabled}
          >
            <TrashEmptyIcon />
          </IconButton>
        )}
      </Stack>
    </>
  );
};
