import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { formatInvitationState } from '@waldur/invitations/InvitationStateFilter';
import { RoleField } from '@waldur/invitations/RoleField';
import { useTitle } from '@waldur/navigation/title';
import { formatRoleType } from '@waldur/permissions/utils';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { InvitationScopeLink } from './InvitationScopeLink';
import { InvitationsFilter } from './InvitationsFilter';

export const InvitationList: FunctionComponent = () => {
  useTitle(translate('Invitations'));
  const filterForm: any = useSelector(getFormValues('AdminInvitationsFilter'));
  const filter = useMemo(
    () => ({
      state: filterForm?.state?.map((option) => option.value),
      role_uuid: filterForm?.role?.uuid,
      customer_uuid: filterForm?.organization?.uuid,
      scope_type: filterForm?.scope_type?.value,
    }),
    [filterForm],
  );
  const props = useTable({
    table: 'admin-invitations',
    fetchData: createFetcher('user-invitations'),
    queryField: 'email',
    filter,
  });

  return (
    <Table
      {...props}
      filters={<InvitationsFilter />}
      columns={[
        {
          title: translate('Email'),
          render: ({ row }) => (
            <div className="d-flex align-items-center gap-1">
              {row.email}
              <CopyToClipboardButton value={row.email} />
            </div>
          ),
          orderField: 'email',
        },
        {
          title: translate('Scope type'),
          render: ({ row }) => formatRoleType(row.scope_type),
          filter: 'scope_type',
          inlineFilter: (row) => ({
            value: row.scope_type,
            label: formatRoleType(row.scope_type),
          }),
        },
        {
          title: translate('Scope'),
          render: InvitationScopeLink,
        },
        {
          title: translate('Role'),
          render: ({ row }) => <RoleField invitation={row} />,
          filter: 'role',
          inlineFilter: (row) =>
            ENV.roles.find((role) => role.name === row.role_name),
        },
        {
          title: translate('Status'),
          orderField: 'state',
          render: ({ row }) => formatInvitationState(row.state),
          filter: 'state',
          inlineFilter: (row) => [
            { value: row.state, label: formatInvitationState(row.state) },
          ],
        },
        {
          title: translate('Created at'),
          orderField: 'created',
          render: ({ row }) => formatDate(row.created),
        },
        {
          title: translate('Expires at'),
          orderField: 'expires',
          render: ({ row }) => formatDate(row.expires),
        },
      ]}
      verboseName={translate('invitations')}
      hasQuery={true}
    />
  );
};
