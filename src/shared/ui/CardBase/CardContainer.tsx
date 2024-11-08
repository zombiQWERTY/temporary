import { Link, Paper } from '@mui/material';
import { ReactNode, PointerEvent } from 'react';

export interface CardContainerProps {
  children: ReactNode;
  href?: string;
  onClick?: (event: PointerEvent<HTMLDivElement>) => void;
  disabled?: boolean;
  minHeight?: string;
}

export const CardContainer = ({
  children,
  href = '',
  onClick,
  disabled = false,
  minHeight = 'auto',
}: CardContainerProps) => {
  const content = (
    <Paper
      sx={{
        padding: 6,
        cursor: disabled ? 'auto' : 'pointer',
        display: 'flex',
        minHeight,
        height: '100%',
        borderRadius: '1.5',
        '&:hover': {
          backgroundColor: disabled ? 'inherit' : 'grey.50',
        },
        '&:active': {
          borderColor: disabled ? 'inherit' : 'primary.main',
        },
      }}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </Paper>
  );

  return href && !disabled ? (
    <Link href={href} sx={{ textDecoration: 'none' }}>
      {content}
    </Link>
  ) : (
    content
  );
};
