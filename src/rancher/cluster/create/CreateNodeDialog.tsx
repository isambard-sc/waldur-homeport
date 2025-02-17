import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { getPublicOffering } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Flavor } from '@waldur/openstack/openstack-instance/types';
import { createNode } from '@waldur/rancher/api';
import { Cluster } from '@waldur/rancher/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { NodeFlavorGroup } from './NodeFlavorGroup';
import { NodeRoleGroup } from './NodeRoleGroup';
import { NodeStorageGroup } from './NodeStorageGroup';
import { SubnetGroup } from './SubnetGroup';
import { loadData } from './utils';

interface OwnProps {
  resolve: { resource: any };
  flavors: any[];
  subnets: any[];
}

interface FormData {
  flavor: Flavor;
  system_volume_size: number;
  system_volume_type: string;
  roles: string[];
  attributes: {
    subnet: string;
  };
}

const serializeDataVolume = ({ size, ...volumeRest }) => ({
  ...volumeRest,
  size: size * 1024,
});

const serializeNode = (cluster, formData) => ({
  cluster: cluster.url,
  roles: formData.roles.filter((role) => role),
  subnet: formData.attributes.subnet,
  flavor: formData.flavor.url,
  system_volume_size: formData.system_volume_size * 1024,
  system_volume_type: formData.system_volume_type,
  data_volumes: (formData.data_volumes || []).map(serializeDataVolume),
});

const loadNodeCreateData = async (cluster: Cluster) => {
  const offering = await getPublicOffering(cluster.marketplace_offering_uuid);
  return await loadData(cluster, offering);
};

export const CreateNodeDialog = reduxForm<FormData, OwnProps>({
  form: 'RancherNodeCreate',
})((props) => {
  const cluster = props.resolve.resource;
  const state = useAsync(() => loadNodeCreateData(cluster), [cluster]);

  const dispatch = useDispatch();

  const callback = useCallback(
    async (formData: FormData) => {
      try {
        await createNode(serializeNode(cluster, formData));
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to create node.')));
        return;
      }
      dispatch(showSuccess(translate('Node has been created.')));
      dispatch(closeModalDialog());
    },
    [dispatch, cluster],
  );

  return (
    <form onSubmit={props.handleSubmit(callback)}>
      <ModalDialog
        title={translate('Create node')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              disabled={state.loading || props.invalid || props.submitting}
              submitting={props.submitting}
              label={translate('Create node')}
            />
          </>
        }
      >
        {state.loading ? (
          <LoadingSpinner />
        ) : state.error ? (
          <p>{translate('Unable to load data.')}</p>
        ) : (
          <>
            <NodeRoleGroup />
            <NodeFlavorGroup options={state.value.flavors} />
            <SubnetGroup options={state.value.subnets} />
            <NodeStorageGroup
              volumeTypes={state.value.volumeTypes}
              mountPoints={state.value.mountPoints}
              defaultVolumeType={state.value.defaultVolumeType}
              sm={{ span: 9, offset: 3 }}
            />
          </>
        )}
      </ModalDialog>
    </form>
  );
});
