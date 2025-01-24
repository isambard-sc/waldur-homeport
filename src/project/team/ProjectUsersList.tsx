import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import Avatar from '@waldur/core/Avatar';
import { renderRoleExpirationDate } from '@waldur/customer/team/CustomerUsersList';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { RoleField } from '@waldur/user/affiliations/RoleField';
import { getProject } from '@waldur/workspace/selectors';

import { PROJECT_USERS_LIST_FILTER_FORM_ID } from '../constants';

import { AddUserButton } from './AddUserButton';
import { ProjectPermisionActions } from './ProjectPermisionActions';
import { ProjectUsersListFilter } from './ProjectUsersListFilter';

const mandatoryFields = [
  // Required for actions
  'user_uuid',
  'user_email',
  'expiration_time',
  'user_full_name',
  'role_name',
  'user_username',
];

const mapStateToFilter = createSelector(
  getFormValues(PROJECT_USERS_LIST_FILTER_FORM_ID),
  (filterValues: any) => {
    const filter: Record<string, string | boolean> = {};
    if (filterValues) {
      if (filterValues.project_role) {
        filter.role = filterValues.project_role.map(({ name }) => name);
      }
    }
    return filter;
  },
);

export const ProjectUsersList = () => {
  const filter = useSelector(mapStateToFilter);
  const project = useSelector(getProject);
  const tableProps = useTable({
    table: 'project-users',
    fetchData: createFetcher(`projects/${project.uuid}/list_users`),
    queryField: 'search_string',
    filter,
    mandatoryFields,
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Member'),
          render: ({ row }) => (
            <div className="d-flex align-items-center gap-1">
              {row.user_image ? (
                <img
                  src={row.user_image}
                  alt={row.user_username}
                  width={25}
                  height={25}
                />
              ) : (
                <Avatar
                  className="symbol symbol-25px"
                  name={row.user_full_name}
                  size={25}
                />
              )}
              {row.user_full_name || DASH_ESCAPE_CODE}
            </div>
          ),
          id: 'member',
          keys: ['user_full_name', 'user_username', 'user_image'],
        },
        {
          title: translate('Email'),
          render: ({ row }) => row.user_email || DASH_ESCAPE_CODE,
          id: 'user_email',
          keys: ['user_email'],
        },
        {
          title: translate('Username'),
          render: ({ row }) => row.user_username,
          id: 'user_username',
          keys: ['user_username'],
          optional: true,
        },
        {
          title: translate('Role in project'),
          render: RoleField,
          id: 'role_name',
          keys: ['role_name'],
          filter: 'project_role',
        },
        {
          title: translate('Role expiration'),
          render: ({ row }) => renderRoleExpirationDate(row),
          id: 'expiration_time',
          keys: ['expiration_time'],
        },
      ]}
      hasQuery={true}
      tableActions={
        <AddUserButton project={project} refetch={tableProps.fetch} />
      }
      title={translate('Team members')}
      verboseName={translate('Team members')}
      rowActions={ProjectPermisionActions}
      filters={<ProjectUsersListFilter />}
      hasOptionalColumns
    />
  );
};
