import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { openstackNetworksCreateSubnet } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { InternalNetworkAllocationPool } from '@waldur/openstack/openstack-subnet/AllocationPoolsField';
import { getFields } from '@waldur/openstack/openstack-subnet/fields';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const CreateSubnetDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  const initialCidr = '192.168.42.0/24';
  const defaultPool = {
    start: '192.168.42.10',
    end: '192.168.42.200',
  };
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create subnet')}
      formFields={[
        ...getFields(),
        {
          name: 'disable_gateway',
          type: 'boolean',
          label: translate('Do not configure a gateway for this subnet'),
        },
        {
          name: 'cidr',
          label: translate('Internal network mask (CIDR)'),
          type: 'string',
        },
        {
          name: 'allocation_pool',
          component: InternalNetworkAllocationPool,
        },
      ]}
      initialValues={{
        cidr: initialCidr,
        allocation_pools: [defaultPool],
      }}
      submitForm={async (formData) => {
        try {
          await openstackNetworksCreateSubnet({
            path: { uuid: resource.uuid },
            body: formData,
          });
          dispatch(showSuccess(translate('Subnet has been created.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to create subnet.')));
        }
      }}
    />
  );
};
