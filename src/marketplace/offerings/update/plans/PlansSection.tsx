import { FC } from 'react';
import { useSelector } from 'react-redux';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { hidePlanAddButton } from '@waldur/marketplace/common/registry';
import { Plan } from '@waldur/marketplace/types';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { createFetcher, Table, useTable } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { getUser } from '@waldur/workspace/selectors';

import { OfferingSectionProps } from '../types';

import { AddPlanButton } from './AddPlanButton';
import { PlanActions } from './PlanActions';

export const PlansSection: FC<OfferingSectionProps> = (props) => {
  const user = useSelector(getUser);

  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
      copyField: (row) => row.name,
    },
    {
      title: translate('Status'),
      render: ({ row }) => (
        <StateIndicator
          label={row.archived ? translate('Archived') : translate('Active')}
          variant={row.archived ? 'warning' : 'success'}
          outline
          pill
        />
      ),
    },
    {
      title: translate('Resources'),
      render: ({ row }) =>
        row.resources_count === 0
          ? translate('Not used')
          : row.resources_count === 1
            ? translate('Used by one resource')
            : translate('Used by {count} resources', {
                count: row.resources_count,
              }),
    },
    {
      title: translate('Organization groups'),
      render: ({ row }) =>
        row.organization_groups.map((group) => group.name).join(', ') ||
        DASH_ESCAPE_CODE,
    },
    {
      title: translate('UUID'),
      render: ({ row }) => row.uuid,
    },
  ];

  const tableProps = useTable({
    table: 'OfferingPlans',
    fetchData: createFetcher('marketplace-plans', {
      params: { offering_uuid: props.offering.uuid },
    }),
  });

  const canCreatePlan =
    !hidePlanAddButton(props.offering.type, props.offering.plans) &&
    hasPermission(user, {
      permission: PermissionEnum.CREATE_OFFERING_PLAN,
      customerId: props.offering.customer_uuid,
    });

  return (
    <Table<Plan>
      {...tableProps}
      columns={columns}
      verboseName={translate('plans')}
      tableActions={
        canCreatePlan && (
          <AddPlanButton refetch={tableProps.fetch} offering={props.offering} />
        )
      }
      rowActions={({ row }) => (
        <PlanActions
          offering={props.offering}
          plan={row}
          refetch={tableProps.fetch}
          user={user}
        />
      )}
    />
  );
};
