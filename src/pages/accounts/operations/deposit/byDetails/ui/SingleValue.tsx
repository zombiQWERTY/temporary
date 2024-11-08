'use client';

import { Box, ClickAwayListener, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { CopyIcon } from '@/shared/ui';

interface SingleValueProps {
  value: string;
}

export const SingleValue = ({ value }: SingleValueProps) => {
  const [isTooltipOpen, setTooltipOpen] = useState(false);

  const closeTooltip = () => setTooltipOpen(false);

  const handleClick = () => {
    navigator.clipboard.writeText(value);
    setTooltipOpen(true);
  };

  return (
    <ClickAwayListener onClickAway={closeTooltip}>
      <Tooltip
        title="Copied"
        open={isTooltipOpen}
        onClose={closeTooltip}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        PopperProps={{ disablePortal: true }}
      >
        <Typography
          variant="BodyMRegular"
          sx={{
            cursor: 'pointer',
            display: 'flex',
            '&:hover > div': { color: (theme) => theme.palette.grey[400] },
          }}
          onClick={handleClick}
        >
          <span>{value}</span>
          <Box sx={{ paddingLeft: '12px', color: 'text.secondary' }}>
            <CopyIcon fontSize="medium" />
          </Box>
        </Typography>
      </Tooltip>
    </ClickAwayListener>
  );
};
