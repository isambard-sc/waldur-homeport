import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { userPermissionsList, UserPermissionsListData } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { formatRoleType } from '@waldur/permissions/utils';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { RolePopover } from './RolePopover';
import { UserAffiliationsFilter } from './UserAffiliationsFilter';

interface UserAffiliationsListProps {
  user;
  hasActionBar?: boolean;
}

interface UserAffiliationsFilterValues {
  scope_type: string;
  scope_name: string;
  role: {
    uuid: string;
  };
}

export const UserAffiliationsList: FunctionComponent<
  UserAffiliationsListProps
> = ({ user, hasActionBar = true }) => {
  const formValues = (useSelector((state) =>
    getFormValues('UserAffiliationsFilter')(state),
  ) as UserAffiliationsFilterValues) || {
    scope_type: undefined,
    scope_name: undefined,
    role: undefined,
  };
  const filter = useMemo(() => {
    const result: UserPermissionsListData['query'] = {
      user: user.uuid,
    };

    if (formValues?.scope_type) {
      result.scope_type = formValues.scope_type;
    }
    if (formValues?.scope_name) {
      result.scope_name = formValues.scope_name;
    }
    if (formValues?.role) {
      result.role_uuid = formValues.role.uuid;
    }

    return result;
  }, [
    user.uuid,
    formValues.scope_type,
    formValues.scope_name,
    formValues.role,
  ]);
  const props = useTable({
    table: 'UserAffiliationsList',
    fetchData: createFetcher(userPermissionsList, {
      parser: (data) => {
        // Filter out broken/stale permissions where the scope resource has been deleted
        // A permission is considered broken if:
        // 1. scope_uuid is null/undefined (deleted resource)
        // 2. scope_name is null/undefined (deleted resource)
        return Array.isArray(data)
          ? data.filter(
              (permission) =>
                permission.scope_uuid &&
                permission.scope_name &&
                permission.scope_type,
            )
          : [];
      },
    }),
    queryField: 'name',
    filter,
  });

  const columns = [
    {
      title: translate('Scope type'),
      render: ({ row }) => <>{formatRoleType(row.scope_type)}</>,
      filter: 'scope_type',
    },
    {
      title: translate('Scope name'),
      render: ({ row }) => {
        if (row.scope_type === 'project') {
          return (
            <Link
              state="project.dashboard"
              params={{ uuid: row.scope_uuid }}
              label={row.scope_name}
            />
          );
        } else if (row.scope_type === 'proposal') {
          return (
            <Link
              state="proposals.manage-proposal"
              params={{ proposal_uuid: row.scope_uuid }}
              label={row.scope_name}
            />
          );
        } else if (row.scope_type === 'call') {
          return (
            <Link
              state="public-call.details"
              params={{ call_uuid: row.scope_uuid }}
              label={row.scope_name}
            />
          );
        } else {
          return <>{row.scope_name}</>;
        }
      },

      filter: 'scope_name',
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
      filter: 'role',
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
      filters={<UserAffiliationsFilter />}
      initialPageSize={10}
      hasActionBar={hasActionBar}
    />
  );
};
