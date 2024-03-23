import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import {
  SUPPORT_CUSTOMER_LIST,
  SUPPORT_CUSTOMERS_FORM_ID,
} from '@waldur/customer/list/constants';
import { OrganizationCreateButton } from '@waldur/customer/list/OrganizationCreateButton';
import { OrganizationEditButton } from '@waldur/customer/list/OrganizationEditButton';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { connectTable, createFetcher, Table } from '@waldur/table';
import { renderFieldOrDash } from '@waldur/table/utils';
import { OrganizationHoverableRow } from '@waldur/user/affiliations/OrganizationHoverableRow';
import { isStaff } from '@waldur/workspace/selectors';

import { OrganizationDetails } from '../../customer/list/OrganizationDetails';
import { OrganizationLink } from '../../customer/list/OrganizationLink';

const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Name'),
      render: OrganizationLink,
      orderField: 'name',
    },
    {
      title: translate('Abbreviation'),
      render: ({ row }) => renderFieldOrDash(row.abbreviation),
    },
    {
      title: translate('Contact email'),
      render: ({ row }) => renderFieldOrDash(row.email),
    },
    {
      title: translate('Contact phone'),
      render: ({ row }) => renderFieldOrDash(row.phone_number),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Organizations')}
      actions={<OrganizationCreateButton />}
      hasQuery={true}
      enableExport={true}
      showPageSizeSelector={true}
      hoverableRow={({ row }) => (
        <>
          <OrganizationHoverableRow row={row} />
          {props.isStaff && <OrganizationEditButton customer={row} />}
        </>
      )}
      expandableRow={({ row }) => <OrganizationDetails customer={row} />}
    />
  );
};

const TableOptions = {
  table: SUPPORT_CUSTOMER_LIST,
  fetchData: createFetcher('customers'),
  queryField: 'query',
  mapPropsToFilter: (props) => {
    const filter: Record<string, string | string[]> = {};
    if (props.filter) {
      if (props.filter.accounting_is_running) {
        filter.accounting_is_running = props.filter.accounting_is_running.value;
      }
      if (props.filter.is_service_provider) {
        filter.is_service_provider = props.filter.is_service_provider.value;
      }
      if (props.filter.organization_group_type) {
        filter.organization_group_type_uuid =
          props.filter.organization_group_type.map((option) => option.uuid);
      }
      if (props.filter.organization_group) {
        filter.organization_group_uuid = props.filter.organization_group.uuid;
      }
    }

    // select required fields
    filter.field = [
      'uuid',
      'name',
      'abbreviation',
      'email',
      'agreement_number',
      'created',
      'contact_details',
      'country',
      'address',
      'postal',
      'phone_number',
      'access_subnets',
      'accounting_start_date',
      'bank_account',
      'bank_name',
      'default_tax_percent',
      'registration_code',
      'vat_code',
      'domain',
      'is_service_provider',
      'organization_group_name',
      'organization_group_parent_name',
    ];

    return filter;
  },
  exportFields: [
    translate('Organization'),
    translate('Abbreviation'),
    translate('Contact email'),
    translate('Contact phone'),
  ],
  exportAll: true,
  exportRow: (row) => [row.name, row.abbreviation, row.email, row.phone_number],
  exportKeys: ['name', 'abbreviation', 'email', 'phone_number'],
};

const mapStateToProps = (state: RootState) => ({
  filter: getFormValues(SUPPORT_CUSTOMERS_FORM_ID)(state),
  isStaff: isStaff(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const SupportCustomerList = enhance(
  TableComponent,
) as React.ComponentType<any>;
