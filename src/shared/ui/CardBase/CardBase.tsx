import { Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { ChevronRightIcon } from '@/shared/ui';
import { CardContainer, CardContainerProps } from './CardContainer';

export interface CardBaseProps extends Omit<CardContainerProps, 'children'> {
  icon?: ReactNode;
  title: string;
  titleDescription?: string;
  subTitle?: string;
  subTitleDescription?: string;
  disabled?: boolean;
}

export const CardBase = ({
  icon,
  title,
  titleDescription,
  subTitle,
  subTitleDescription,
  disabled,
  href,
  onClick,
  minHeight,
}: CardBaseProps) => (
  <CardContainer
    href={href}
    onClick={onClick}
    disabled={disabled}
    minHeight={minHeight}
  >
    <Stack direction="row" gap={4} width="100%" justifyContent="space-between">
      <Stack
        direction="row"
        gap={2}
        color={disabled ? 'text.secondary' : 'primary.main'}
        alignItems="flex-start"
      >
        {icon}
        <Stack gap={2}>
          <Typography
            variant="BodyMMedium"
            color={disabled ? 'text.secondary' : 'text.primary'}
          >
            {title}
          </Typography>
          {titleDescription && (
            <Typography variant="BodySRegular" color="text.secondary">
              {titleDescription}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Stack alignItems="flex-end" justifyContent="flex-start">
        <Stack direction="row" gap={2} alignItems="center">
          {subTitle && (
            <Typography variant="BodySRegular" color="text.secondary">
              {subTitle}
            </Typography>
          )}
          <ChevronRightIcon
            fontSize="large"
            color={disabled ? 'secondary' : 'primary'}
          />
        </Stack>
        {subTitleDescription && (
          <Typography variant="BodySRegular" color="text.secondary">
            {subTitleDescription}
          </Typography>
        )}
      </Stack>
    </Stack>
  </CardContainer>
);
