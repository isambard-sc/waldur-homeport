import { FunctionComponent } from 'react';
import Gravatar from 'react-gravatar';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { InvitationExpandableRow } from '@waldur/invitations/InvitationExpandableRow';
import { useTitle } from '@waldur/navigation/title';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import { getCustomer } from '@waldur/workspace/selectors';

import { InvitationCancelButton } from './actions/InvitationCancelButton';
import { InvitationCreateButton } from './actions/InvitationCreateButton';
import { InvitationSendButton } from './actions/InvitationSendButton';
import { InvitationsFilter } from './InvitationsFilter';
import { RoleField } from './RoleField';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Email'),
          render: ({ row }) => (
            <>
              <Gravatar email={row.email} size={25} /> {row.email}
            </>
          ),
          orderField: 'email',
        },
        {
          title: translate('Role'),
          render: ({ row }) => <RoleField invitation={row} />,
        },
        {
          title: translate('Status'),
          orderField: 'state',
          render: ({ row }) => row.state,
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
      verboseName={translate('team invitations')}
      actions={<InvitationCreateButton refreshList={props.fetch} />}
      hasQuery={true}
      hoverableRow={
        props.showActions ?? true
          ? ({ row }) => (
              <>
                <InvitationSendButton invitation={row} />
                <InvitationCancelButton
                  invitation={row}
                  refreshList={props.fetch}
                />
              </>
            )
          : undefined
      }
      expandableRow={InvitationExpandableRow}
    />
  );
};

const mapPropsToFilter = (props) => ({
  ...props.stateFilter,
  state: props.stateFilter?.state?.map((option) => option.value),
  customer: props.customer.uuid,
});

const TableOptions: TableOptionsType = {
  table: 'user-invitations',
  fetchData: createFetcher('user-invitations'),
  mapPropsToFilter,
  queryField: 'email',
};

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  stateFilter: getFormValues('InvitationsFilter')(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

const InvitationsListComponent = enhance(
  TableComponent,
) as React.ComponentType<any>;

export const InvitationsList: FunctionComponent = () => {
  useTitle(translate('Invitations'));
  return <InvitationsListComponent filters={<InvitationsFilter />} />;
};
