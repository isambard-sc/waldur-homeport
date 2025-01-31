import { FC } from 'react';

import Avatar from '@waldur/core/Avatar';
import { renderRoleExpirationDate } from '@waldur/customer/team/CustomerUsersList';
import { translate } from '@waldur/i18n';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { RoleField } from '@waldur/user/affiliations/RoleField';
import { UserDetailsButton } from '@waldur/user/UserDetailsButton';
import { Customer, Project } from '@waldur/workspace/types';

const organizationUserMandatoryFields = [
  'uuid',
  'email',
  'username',
  'image',
  'full_name',
  'expiration_time',
  'role_name',
];
const projectUserMandatoryFields = [
  'uuid',
  'user_uuid',
  'user_email',
  'user_username',
  'user_image',
  'user_full_name',
  'expiration_time',
  'role_name',
];

const RowActions = ({ row }) => {
  return (
    <ActionsDropdownComponent>
      <UserDetailsButton userId={row.user_uuid || row.uuid} asDropdownItem />
    </ActionsDropdownComponent>
  );
};

interface OwnProps {
  scope: Customer | Project;
  context: 'organization' | 'project';
}

export const SummaryTeamTable: FC<OwnProps> = ({ scope, context }) => {
  const props = useTable({
    table: context === 'organization' ? 'customer-users' : 'project-users',
    fetchData:
      context === 'organization'
        ? createFetcher(`customers/${scope.uuid}/users`)
        : createFetcher(`projects/${scope.uuid}/list_users`),
    mandatoryFields:
      context === 'organization'
        ? organizationUserMandatoryFields
        : projectUserMandatoryFields,
  });

  const getValue = (row, field) =>
    context === 'project' ? row['user_' + field] : row[field];

  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Member'),
          render: ({ row }) => (
            <div className="content-wrapper gap-2">
              {getValue(row, 'image') ? (
                <img
                  src={getValue(row, 'image')}
                  alt={getValue(row, 'username')}
                  width={25}
                  height={25}
                  className="rounded-circle"
                />
              ) : (
                <Avatar
                  className="symbol symbol-25px symbol-circle"
                  name={getValue(row, 'full_name')}
                  size={25}
                />
              )}
              <p className="mb-0">
                {getValue(row, 'full_name') || DASH_ESCAPE_CODE}
              </p>
            </div>
          ),
          orderField:
            (context === 'organization' && 'concatenated_name') ||
            (context === 'project' && 'full_name'),
        },
        {
          title: translate('Email'),
          render: ({ row }) => getValue(row, 'email') || DASH_ESCAPE_CODE,
        },
        {
          title:
            context === 'organization'
              ? translate('Role in organization')
              : translate('Role in project'),
          render: RoleField,
          className: 'w-25',
        },
        {
          title: translate('Role expiration'),
          render: ({ row }) => renderRoleExpirationDate(row),
          className: 'w-45px',
        },
      ]}
      verboseName={translate('Team members')}
      hasActionBar={false}
      hoverShadow={false}
      initialSorting={
        (context === 'organization' && {
          field: 'concatenated_name',
          mode: 'asc',
        }) ||
        (context === 'project' && {
          field: 'full_name',
          mode: 'asc',
        })
      }
      initialPageSize={5}
      minHeight="auto"
      rowActions={RowActions}
    />
  );
};
