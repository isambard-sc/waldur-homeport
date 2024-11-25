import { FunctionComponent, useMemo } from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { formatRoleType } from '@waldur/permissions/utils';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { RolePopover } from './RolePopover';

interface UserAffiliationsListProps {
  user;
  hasActionBar?: boolean;
}

export const UserAffiliationsList: FunctionComponent<
  UserAffiliationsListProps
> = ({ user, hasActionBar = true }) => {
  const filter = useMemo(() => ({ user: user.uuid }), [user]);
  const props = useTable({
    table: 'UserAffiliationsList',
    fetchData: createFetcher('user-permissions'),
    queryField: 'name',
    filter,
  });

  const columns = [
    {
      title: translate('Scope type'),
      render: ({ row }) => <>{formatRoleType(row.scope_type)}</>,
    },
    {
      title: translate('Scope name'),
      render: ({ row }) =>
        row.scope_type === 'project' ? (
          <Link
            state="project.dashboard"
            params={{ uuid: row.scope_uuid }}
            label={row.scope_name}
          />
        ) : (
          <>{row.scope_name}</>
        ),
    },
    {
      title: translate('Organization'),
      render: ({ row }) =>
        row.scope_type === 'customer' ? (
          <Link
            state="organization.dashboard"
            params={{ uuid: row.scope_uuid }}
            label={row.scope_name}
          />
        ) : row.customer_uuid ? (
          <Link
            state="organization.dashboard"
            params={{ uuid: row.customer_uuid }}
            label={row.customer_name}
          />
        ) : (
          <>N/A</>
        ),
    },
    {
      title: translate('Role name'),
      render: ({ row }) => <RolePopover roleName={row.role_name} />,
    },
    {
      title: translate('Valid till'),
      render: ({ row }) => (
        <>
          {row.expiration_time
            ? formatDate(row.expiration_time)
            : DASH_ESCAPE_CODE}
        </>
      ),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('affiliations')}
      title={translate('Roles and permissions')}
      initialPageSize={100}
      hasActionBar={hasActionBar}
    />
  );
};
