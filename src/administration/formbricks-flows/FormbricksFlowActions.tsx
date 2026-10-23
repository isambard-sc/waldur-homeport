import { FC } from 'react';
import { FormbricksFlow } from 'waldur-js-client';

import { ActionsDropdown } from '@/table/ActionsDropdown';

import { FormbricksFlowDeleteAction } from './FormbricksFlowDeleteAction';
import { FormbricksFlowEditAction } from './FormbricksFlowEditAction';

export const FormbricksFlowActions: FC<{
  row: FormbricksFlow;
  refetch(): void;
}> = ({ row, refetch }) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[FormbricksFlowEditAction, FormbricksFlowDeleteAction]}
  />
);
