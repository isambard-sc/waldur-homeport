import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { PlanUsageButton } from './PlanUsageButton';

export const PlanUsageRowActions = (row) => {
  return (
    <ActionsDropdown
      row={row}
      actions={[(props) => <PlanUsageButton {...props.row} />].filter(Boolean)}
    />
  );
};
