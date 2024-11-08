import { IconButton, Link } from '@mui/material';
import { ChevronLeftIcon } from '@/shared/ui';

interface BackButtonProps {
  href: string;
}

export const BackButton = (props: BackButtonProps) => {
  return (
    <Link href={props.href}>
      <IconButton
        size="extraLarge"
        variant="outlineSquare"
        sx={{ backgroundColor: '#fff' }}
      >
        <ChevronLeftIcon />
      </IconButton>
    </Link>
  );
};
