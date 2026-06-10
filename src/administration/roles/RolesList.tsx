import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { RoleDetails, rolesList } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { formatRoleType } from '@waldur/permissions/utils';
import { createFetcher } from '@waldur/table/api';
import { BooleanField } from '@waldur/table/BooleanField';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { RoleActions } from './RoleActions';
import { RoleCreateButton } from './RoleCreateButton';

const RoleUsersDialog = lazyComponent(() =>
  import('./RoleUsersDialog').then((m) => ({ default: m.RoleUsersDialog })),
);

const UsersCountCell = ({ row }: { row: RoleDetails }) => {
  const dispatch = useDispatch();
  const open = useCallback(
    () =>
      dispatch(
        openModalDialog(RoleUsersDialog, { resolve: { role: row }, size: 'xl' }),
      ),
    [dispatch, row],
  );
  if (!row.users_count) return <>{row.users_count ?? 0}</>;
  return (
    <button type="button" className="btn btn-link p-0" onClick={open}>
      {row.users_count}
    </button>
  );
};

export const RolesList = () => {
  const tableProps = useTable({
    table: `RolesList`,
    fetchData: createFetcher(rolesList),
  });

  return (
    <Table<RoleDetails>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => (
            <>
              {row.name}{' '}
              {row.is_system_role && (
                <Badge outline pill className="ms-2">
                  {translate('System role')}
                </Badge>
              )}
            </>
          ),

          copyField: (row) => row.name,
        },
        {
          title: translate('Scope'),
          render: ({ row }) => formatRoleType(row.content_type),
        },
        {
          title: translate('Description'),
          render: ({ row }) => row.description,
        },
        {
          title: translate('Assigned users count'),
          render: ({ row }) => <UsersCountCell row={row} />,
        },
        {
          title: translate('Active'),
          render: ({ row }) => <BooleanField value={row.is_active} />,
        },
      ]}
      verboseName={translate('roles')}
      rowActions={({ row }) => (
        <RoleActions row={row} refetch={tableProps.fetch} />
      )}
      showPageSizeSelector={true}
      tableActions={<RoleCreateButton refetch={tableProps.fetch} />}
    />
  );
};
