import {
  Dialog as MuiDialog,
  DialogProps as MuiDialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import { ReactNode } from 'react';

export interface DialogProps extends MuiDialogProps {
  title?: string;
  subTitle?: string;
  dialogActions?: ReactNode;
  isLoading?: boolean;
}

export const Dialog = ({
  children,
  title,
  subTitle,
  dialogActions,
  isLoading,
  ...props
}: DialogProps) => (
  <MuiDialog
    {...props}
    classes={{ container: 'custom-dialog-container' }}
    PaperProps={{
      sx: {
        maxWidth: 'min-content',
      },
    }}
  >
    {isLoading && <LinearProgress />}
    <DialogTitle sx={{ pb: 10, fontSize: '24px', fontWeight: 600 }}>
      {title}
    </DialogTitle>
    {isLoading ? (
      <DialogContent>
        <Skeleton animation="wave" />
      </DialogContent>
    ) : (
      <DialogContent sx={{ pb: 10 }}>
        {subTitle && (
          <DialogContentText sx={{ mb: 10 }}>{subTitle}</DialogContentText>
        )}
        {children}
      </DialogContent>
    )}

    {dialogActions && <DialogActions>{dialogActions}</DialogActions>}
  </MuiDialog>
);
