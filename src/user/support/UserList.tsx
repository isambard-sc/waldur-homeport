import { Question } from '@phosphor-icons/react';
import { cloneDeep } from 'lodash';
import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { RoleEnum } from '@waldur/permissions/enums';
import { formatRole } from '@waldur/permissions/utils';
import { BooleanField } from '@waldur/table/BooleanField';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { Table, createFetcher } from '@waldur/table/index';
import { useTable } from '@waldur/table/utils';
import { User } from '@waldur/workspace/types';

import { UserDetailsButton } from './UserDetailsButton';
import { UserFilter } from './UserFilter';
import { UserImpersonateButton } from './UserImpersonateButton';
import { UserTableActions } from './UserTableActions';

const renderFieldOrDash = (field) => {
  return field ? field : DASH_ESCAPE_CODE;
};

const PhoneNumberField = ({ row }) => (
  <>{renderFieldOrDash(row.phone_number)}</>
);

const EmailField = ({ row }) => <>{renderFieldOrDash(row.email)}</>;

const FullNameField = ({ row }) => <>{renderFieldOrDash(row.full_name)}</>;

const OrganizationField = ({ row }) => (
  <>{renderFieldOrDash(row.organization)}</>
);

const StaffStatusField = ({ row }) => {
  return <BooleanField value={row.is_staff} />;
};

const UserStatusField = ({ row }) => {
  return <BooleanField value={row.is_active} />;
};

const OrganizationRolesField = ({ row }) => {
  const permissions = row.permissions?.filter(
    ({ scope_type }) => scope_type === 'customer',
  );
  if (permissions.length > 0) {
    return permissions.map((permission, index) => (
      <span key={index}>
        <Tip
          key={index}
          label={formatRole(permission.role_name)}
          id="customer-role"
        >
          {permission.scope_name} <Question />
        </Tip>
        <br />
      </span>
    ));
  } else {
    return DASH_ESCAPE_CODE;
  }
};

const ProjectRolesField = ({ row }) => {
  const permissions = row.permissions?.filter(
    ({ scope_type }) => scope_type === 'project',
  );
  if (permissions.length > 0) {
    return permissions.map((permission, index) => (
      <span key={index}>
        <Tip
          key={index}
          label={translate('{role} ({name})', {
            role: formatRole(permission.role_name),
            name: permission.customer_name,
          })}
          id="project-role"
        >
          {permission.scope_name} <Question />
        </Tip>
        <br />
      </span>
    ));
  } else {
    return DASH_ESCAPE_CODE;
  }
};

const SupportStatusField = ({ row }) => {
  return <BooleanField value={row.is_support} />;
};

const renderListOrDash = (list) => {
  return (
    <>
      {list && list.length > 0
        ? list.map((item, index) => <div key={index}>{item}</div>)
        : DASH_ESCAPE_CODE}
    </>
  );
};
const RowActions = ({ row }) => {
  return (
    <>
      <UserImpersonateButton row={row} />
      <UserDetailsButton row={row} />
    </>
  );
};

const mapStateToFilter = createSelector(
  getFormValues('userFilter'),
  (filters: any) => {
    const params = cloneDeep(formatRoleFilter(filters));
    if (filters?.organization?.uuid) {
      params.customer_uuid = filters.organization.uuid;
    }
    if (params?.organization) {
      delete params.organization;
    }
    return params;
  },
);

export const UserList: FunctionComponent = () => {
  const filterValues = useSelector(mapStateToFilter);
  const filter = useMemo(() => {
    return {
      ...filterValues,
      field: ['uuid', 'url', 'identity_provider_fields', 'registration_method'],
    };
  }, [filterValues]);

  const props = useTable({
    table: `userList`,
    fetchData: createFetcher('users'),
    queryField: 'query',
    filter,
    exportFields: [
      'Full name',
      'Username',
      'Email',
      'Phone number',
      'Organization',
      'Organizations owner',
    ],
    exportAll: true,
    exportRow: (row) => [
      row.full_name,
      row.username,
      row.email,
      row.phone_number,
      row.organization,
      getOrganizationsWhereOwner(row),
    ],
    exportKeys: [
      'full_name',
      'username',
      'email',
      'phone_number',
      'organization',
      'permissions',
    ],
  });

  const columns = [
    {
      title: translate('Full name'),
      render: FullNameField,
      orderField: 'full_name',
      keys: ['full_name'],
      id: 'full_name',
    },
    {
      title: translate('Email'),
      render: EmailField,
      orderField: 'email',
      keys: ['email'],
      id: 'email',
    },
    {
      title: translate('Phone number'),
      render: PhoneNumberField,
      orderField: 'phone_number',
      keys: ['phone_number'],
      id: 'phone_number',
    },
    {
      title: translate('Organization'),
      render: OrganizationField,
      orderField: 'organization',
      filter: 'organization',
      id: 'organization',
    },
    {
      title: translate('Organization roles'),
      render: OrganizationRolesField,
      keys: ['permissions'],
      id: 'organization_roles',
    },
    {
      title: translate('Project roles'),
      render: ProjectRolesField,
      keys: ['permissions'],
      id: 'project_roles',
    },
    {
      title: translate('Staff'),
      render: StaffStatusField,
      className: 'text-center',
      keys: ['is_staff'],
      optional: true,
      id: 'is_staff',
    },
    {
      title: translate('Support'),
      render: SupportStatusField,
      className: 'text-center',
      keys: ['is_support'],
      optional: true,
      id: 'is_support',
    },
    {
      title: translate('Status'),
      render: UserStatusField,
      className: 'text-center',
      keys: ['is_active'],
      filter: 'is_active',
      id: 'is_active',
    },
    {
      title: translate('Affiliations'),
      render: ({ row }) => renderListOrDash(row.affiliations),
      keys: ['affiliations'],
      optional: true,
      id: 'affiliations',
    },
    {
      title: translate('Civil number'),
      render: ({ row }) => renderFieldOrDash(row.civil_number),
      keys: ['civil_number'],
      optional: true,
      id: 'civil_number',
    },
    {
      title: translate('Job title'),
      render: ({ row }) => renderFieldOrDash(row.job_title),
      keys: ['job_title'],
      optional: true,
      id: 'job_title',
    },
    {
      title: translate('Date joined'),
      render: ({ row }) => formatDateTime(row.date_joined),
      keys: ['date_joined'],
      optional: true,
      id: 'date_joined',
    },
    {
      title: translate('Agreement date'),
      render: ({ row }) => formatDateTime(row.agreement_date),
      keys: ['agreement_date'],
      optional: true,
      id: 'agreement_date',
    },
    {
      title: translate('Username'),
      render: ({ row }) => renderFieldOrDash(row.username),
      keys: ['username'],
      optional: true,
      id: 'username',
    },
    {
      title: translate('UUID'),
      render: ({ row }) => <>{row.uuid}</>,
      keys: ['uuid'],
      optional: true,
      id: 'uuid',
    },
    {
      title: translate('Description'),
      render: ({ row }) => renderFieldOrDash(row.description),
      keys: ['description'],
      optional: true,
      id: 'description',
    },
    {
      title: translate('Identity provider name'),
      render: ({ row }) => renderFieldOrDash(row.identity_provider_name),
      keys: ['identity_provider_name'],
      optional: true,
      id: 'identity_provider_name',
    },
    {
      title: translate('Identity provider fields'),
      render: ({ row }) => renderListOrDash(row.identity_provider_fields),
      keys: ['identity_provider_fields'],
      optional: true,
      id: 'identity_provider_fields',
    },
    {
      title: translate('Requested email'),
      render: ({ row }) => renderFieldOrDash(row.requested_email),
      keys: ['requested_email'],
      optional: true,
      id: 'requested_email',
    },
    {
      title: translate('Registration method'),
      render: ({ row }) => renderFieldOrDash(row.registration_method),
      keys: ['registration_method'],
      optional: true,
      id: 'registration_method',
    },
    {
      title: translate('Preferred language'),
      render: ({ row }) => renderFieldOrDash(row.preferred_language),
      keys: ['preferred_language'],
      optional: true,
      id: 'preferred_language',
    },
  ];

  return (
    <Table
      {...props}
      filters={<UserFilter />}
      columns={columns}
      hoverableRow={RowActions}
      showPageSizeSelector={true}
      hasOptionalColumns
      verboseName={translate('users')}
      enableExport={true}
      actions={<UserTableActions refetch={props.fetch} />}
      hasQuery={true}
    />
  );
};

export const formatRoleFilter = (filter) => {
  if (filter && filter.role) {
    const formattedRole = {};
    filter.role.map((item) => {
      formattedRole[item.value] = true;
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { role, ...rest } = filter;
    return {
      ...rest,
      ...formattedRole,
    };
  }
  return filter;
};

export const getOrganizationsWhereOwner = (user: Partial<User>) =>
  user.permissions
    .filter((perm) => perm.role_name === RoleEnum.CUSTOMER_OWNER)
    .map((perm) => perm.scope_name)
    .join(', ');
