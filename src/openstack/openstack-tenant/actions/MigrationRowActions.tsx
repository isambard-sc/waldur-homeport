import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { DeleteMigrationAction } from '../DeleteMigrationAction';

import { ExecuteMigrationAction } from './ExecuteMigrationAction';

export const MigrationRowActions = ({ row, refetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        () => (
          <>
            <ExecuteMigrationAction resource={row} refetch={refetch} />
            <DeleteMigrationAction resource={row} refetch={refetch} />
          </>
        ),
      ].filter(Boolean)}
    />
  );
};
