import {
  Avatar as MuiAvatar,
  AvatarProps as MuiAvatarProps,
} from '@mui/material';

export type AvatarSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'extraLarge'
  | 'xxl'
  | 'xxxl'
  | 'xxxxl';

const sizeByType: Record<AvatarSize, number> = {
  small: 16,
  medium: 24,
  large: 32,
  extraLarge: 40,
  xxl: 48,
  xxxl: 56,
  xxxxl: 80,
} as const;

export interface AvatarProps extends Omit<MuiAvatarProps, 'size'> {
  size?: AvatarSize;
}

export const Avatar = ({ size = 'extraLarge', src, ...props }: AvatarProps) => (
  <MuiAvatar
    {...props}
    sx={{
      width: sizeByType[size],
      height: sizeByType[size],
    }}
    src={src || '/images/empty-avatar.png'}
  />
);
