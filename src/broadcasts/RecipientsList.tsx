import { FunctionComponent } from 'react';
import { Badge } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';

const BadgesList = ({ items }) => (
  <>
    {items.map((c, index) => (
      <Badge key={index} className="me-3">
        {c.name}
      </Badge>
    ))}
  </>
);

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      hasActionBar={false}
      columns={[
        {
          title: translate('Recipient'),
          render: ({ row }) => <>{row.full_name}</>,
        },
        {
          title: translate('Email'),
          render: ({ row }) => <>{row.email}</>,
        },
        {
          title: translate('Offerings'),
          render: ({ row }) => <BadgesList items={row.offerings} />,
        },
        {
          title: translate('Organizations'),
          render: ({ row }) => <BadgesList items={row.customers} />,
        },
      ]}
      verboseName={translate('recepients')}
    />
  );
};

const TableOptions = {
  table: 'broadcast-recipients',
  fetchData: createFetcher('broadcast-messages/recipients'),
  mapPropsToFilter: (props) => ({
    all_users: props.query?.all_users,
    customers: props.query?.customers?.map((c) => c.uuid),
    offerings: props.query?.offerings?.map((c) => c.uuid),
  }),
};

export const RecipientsListComponent =
  connectTable(TableOptions)(TableComponent);

const mapStateToProps = (state: RootState, ownProps: any) => ({
  query: getFormValues(ownProps.form)(state),
});

export const RecipientsList = connect(mapStateToProps)(RecipientsListComponent);
