import {
  Stack,
  Typography,
  CircularProgress,
  LinearProgress,
} from '@mui/material';

import { InternalFileSchema, FilesUploadProgress } from '../../model/types';

interface LoadingFileProps {
  file: InternalFileSchema;
  loadingProgress?: FilesUploadProgress | null;
}

export const LoadingFile = ({ file, loadingProgress }: LoadingFileProps) => (
  <Stack flexDirection="row" gap={4} flex={1}>
    <CircularProgress />
    <Stack width="70%" gap={4}>
      <Typography
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        variant="BodySRegular"
      >
        {file.name}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={loadingProgress?.[file.internalId] || 0}
      />
    </Stack>
  </Stack>
);
