import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import { getCustomer } from '@waldur/workspace/selectors';

import { formatPeriod } from '../utils';

import { InvoicesFilter } from './InvoicesFilter';
import { SendNotificationButton } from './SendNotificationButton';

const RecordPeriodField = ({ row }) => formatPeriod(row);

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Record number'),
          render: ({ row }) => (
            <Link
              state="billingDetails"
              params={{ uuid: props.customer.uuid, invoice_uuid: row.uuid }}
            >
              {row.number}
            </Link>
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => row.state,
        },
        {
          title: translate('Record period'),
          render: RecordPeriodField,
        },
        {
          title: (
            <>
              <PriceTooltip /> {translate('Total')}
            </>
          ),
          render: ({ row }) => defaultCurrency(row.price),
        },
      ]}
      hoverableRow={SendNotificationButton}
      verboseName={translate('records')}
      enableExport={true}
    />
  );
};

const exportRow = (row) => [
  row.number,
  row.state,
  formatPeriod(row),
  defaultCurrency(row.price),
];

const exportFields = ['Record number', 'State', 'Record period', 'Total'];

const mapPropsToFilter = (props) => ({
  ...props.stateFilter,
  customer: props.customer.url,
  state: props.stateFilter?.state?.map((option) => option.value),
  field: ['uuid', 'state', 'month', 'year', 'invoice_date', 'number', 'price'],
});

const TableOptions: TableOptionsType = {
  table: 'invoices',
  fetchData: createFetcher('invoices'),
  mapPropsToFilter,
  exportRow,
  exportFields,
  queryField: 'number',
  mapPropsToTableId: (props) => [props.customer.uuid],
};

const mapsStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  stateFilter: getFormValues('InvoicesFilter')(state),
});

const enhance = compose(connect(mapsStateToProps), connectTable(TableOptions));

const BillingRecordsListComponent = enhance(
  TableComponent,
) as React.ComponentType<any>;

export const BillingRecordsList: FunctionComponent = () => (
  <BillingRecordsListComponent filters={<InvoicesFilter />} />
);
