import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import { getCustomer } from '@waldur/workspace/selectors';

import { approveResource, rejectResource } from './api';
import { ResourceCreateExpandableRow } from './ResourceCreateExpandableRow';
import { ReviewActions } from './ReviewActions';
import { getColumns } from './utils';

export const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={getColumns()}
      verboseName={translate('requests')}
      showPageSizeSelector={true}
      hoverableRow={({ row }) => (
        <ReviewActions
          request={row}
          refreshList={props.fetch}
          approveMethod={approveResource}
          rejectMethod={rejectResource}
        />
      )}
      expandableRow={ResourceCreateExpandableRow}
    />
  );
};

export const TableOptions: TableOptionsType = {
  table: 'ResourceCreateRequestsList',
  fetchData: createFetcher('marketplace-resource-creation-requests'),
  mapPropsToFilter: (props) => ({
    service_provider_uuid: props.customer?.uuid,
  }),
};

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const ResourceCreateRequestsList = enhance(TableComponent);
