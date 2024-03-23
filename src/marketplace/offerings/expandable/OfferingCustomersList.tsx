import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { Table, connectTable } from '@waldur/table';
import { renderFieldOrDash } from '@waldur/table/utils';

import { fetchProviderOfferingCustomers } from './api';
import { OFFERING_CUSTOMERS_LIST_TABLE_ID } from './constants';

const TableComponent: FunctionComponent<any> = (props) => {
  const { filterColumns } = props;
  const columns = filterColumns([
    {
      title: translate('Organization'),
      render: ({ row }) => <>{row.name}</>,
    },
    {
      title: translate('Abbreviation'),
      render: ({ row }) => <>{renderFieldOrDash(row.abbreviation)}</>,
    },
  ]);

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Organizations')}
      hasQuery={true}
      showPageSizeSelector={true}
      hasActionBar={false}
    />
  );
};

const mapPropsToFilter = ({ customerListFilter, offeringUuid }) => ({
  accounting_is_running: customerListFilter?.accounting_is_running
    ? customerListFilter.accounting_is_running.value
    : undefined,
  offering_uuid: offeringUuid,
});

const TableOptions = {
  table: OFFERING_CUSTOMERS_LIST_TABLE_ID,
  fetchData: fetchProviderOfferingCustomers,
  queryField: 'query',
  mapPropsToFilter: (props) => mapPropsToFilter(props),
  mapPropsToTableId: (props) => [props.offeringUuid],
};

const mapStateToProps = (state, ownProps) => ({
  customerListFilter: getFormValues(ownProps.uniqueFormId)(state),
});

const enhance = compose<any>(
  connect(mapStateToProps),
  connectTable(TableOptions),
);

export const OfferingCustomersList = enhance(TableComponent);
