import { Delete } from '@mui/icons-material';
import { ListItemIcon, MenuItem } from '@mui/material';
import { QueryObserverBaseResult } from '@tanstack/query-core';

import { PaginatedResponse } from '@/shared/api';
import { BaseRow } from '@/shared/ui';
import { useShowConfirmModal } from './DeleteRowModal';

export const DeleteAction = <T extends BaseRow>({
  row,
  deleteApiFn,
  closeMenu,
  refetchList,
}: {
  row: T;
  deleteApiFn: (id: number) => Promise<any>;
  closeMenu: () => void;
  refetchList: QueryObserverBaseResult<PaginatedResponse<T>>['refetch'];
}) => {
  const handleClick = () => {
    return deleteApiFn(row.id as number).then(() => {
      closeMenu();
      return refetchList();
    });
  };

  const { showConfirmModal } = useShowConfirmModal({
    handleOnSave: handleClick,
    handleOnCancel: closeMenu,
  });

  return (
    <MenuItem
      onClick={() => {
        showConfirmModal();
      }}
      sx={{ m: 0 }}
    >
      <ListItemIcon>
        <Delete />
      </ListItemIcon>
      Delete
    </MenuItem>
  );
};
