import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';
import { openstackInstancesUpdateSecurityGroups } from 'waldur-js-client';
import { OpenStackInstance } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { Option } from '@waldur/marketplace/common/registry';
import { closeModalDialog } from '@waldur/modal/actions';
import { loadSecurityGroups } from '@waldur/openstack/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface UpdateSecurityGroupsFormData {
  security_groups: Option[];
}

export const useUpdateSecurityGroupsForm = (
  resource: OpenStackInstance,
  refetch?,
) => {
  const asyncState = useAsync(
    () =>
      loadSecurityGroups({
        tenant_uuid: resource.tenant_uuid,
        field: ['name', 'url'],
      }).then((groups) =>
        groups.map((group) => ({
          label: group.name,
          value: group.url,
        })),
      ),
    [resource.service_settings_uuid],
  );
  const dispatch = useDispatch();
  const submitRequest = async (formData: UpdateSecurityGroupsFormData) => {
    try {
      await openstackInstancesUpdateSecurityGroups({
        path: { uuid: resource.uuid },
        body: {
          security_groups: (formData.security_groups || []).map(
            (item) => item.value,
          ),
        },
      });
      dispatch(
        showSuccess(
          translate(
            'Update of OpenStack instance security groups has been scheduled.',
          ),
        ),
      );
      if (refetch) {
        await refetch();
      }
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to update security groups of OpenStack instance.'),
        ),
      );
    }
  };
  const initialValues = useMemo<UpdateSecurityGroupsFormData>(
    () => ({
      security_groups: resource.security_groups.map((group) => ({
        label: group.name,
        value: group.url,
      })),
    }),
    [resource.security_groups],
  );
  return { resource, asyncState, submitRequest, initialValues };
};

const FORM_NAME = 'UpdateSecurityGroups';

type UpdateSecurityGroupsOwnProps = ReturnType<
  typeof useUpdateSecurityGroupsForm
>;

export const connectForm = reduxForm<
  UpdateSecurityGroupsFormData,
  UpdateSecurityGroupsOwnProps
>({
  form: FORM_NAME,
});
