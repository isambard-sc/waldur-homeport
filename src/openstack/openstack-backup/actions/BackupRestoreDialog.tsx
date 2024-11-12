import arrayMutators from 'final-form-arrays';
import { FC } from 'react';
import { FormGroup, FormLabel } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { useAsync } from 'react-use';

import { required } from '@waldur/core/validators';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { restoreBackup } from '@waldur/openstack/api';
import { AsyncActionDialog } from '@waldur/resource/actions/AsyncActionDialog';
import { useNotify } from '@waldur/store/hooks';

import { OpenStackBackup } from '../types';

import { NetworksList } from './NetworksList';
import {
  BackupRestoreFormData,
  getInitialValues,
  loadData,
  serializeBackupRestoreFormData,
} from './utils';

export const BackupRestoreDialog: FC<{
  resolve: { resource: OpenStackBackup; refetch?(): void };
}> = ({ resolve: { resource, refetch } }) => {
  const asyncState = useAsync(() => loadData(resource), [resource]);
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const submitRequest = async (formData: BackupRestoreFormData) => {
    try {
      await restoreBackup(
        resource.uuid,
        serializeBackupRestoreFormData(formData),
      );
      showSuccess(translate('VM snapshot restoration has been scheduled.'));
      closeDialog();
      if (refetch) {
        await refetch();
      }
    } catch (e) {
      showErrorResponse(e, translate('Unable to restore VM snapshot.'));
    }
  };

  return (
    <Form
      mutators={{
        ...arrayMutators,
      }}
      onSubmit={submitRequest}
      initialValues={getInitialValues(resource)}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <AsyncActionDialog
            title={translate('Restore virtual machine from backup {name}', {
              name: resource.name,
            })}
            loading={asyncState.loading}
            error={asyncState.error}
            submitting={submitting}
            invalid={invalid}
          >
            {asyncState.value ? (
              <>
                <FormGroup className="mb-5">
                  <FormLabel id="flavor">{translate('Flavor')}</FormLabel>
                  <Field
                    name="flavor"
                    validate={required}
                    render={({ input }) => (
                      <Select
                        {...input}
                        options={asyncState.value.flavors}
                        aria-labelledby="flavor"
                      />
                    )}
                  />
                </FormGroup>
                <FormGroup className="mb-5">
                  <FormLabel id="security-groups">
                    {translate('Security groups')}
                  </FormLabel>
                  <Field
                    name="security_groups"
                    render={({ input }) => (
                      <Select
                        {...input}
                        placeholder={translate('Select security groups...')}
                        isMulti={true}
                        options={asyncState.value.securityGroups}
                        aria-labelledby="security-groups"
                      />
                    )}
                  />
                </FormGroup>
                <FormGroup className="mb-5">
                  <FormLabel>{translate('Networks')}</FormLabel>
                  <FieldArray
                    name="networks"
                    component={NetworksList as any}
                    subnets={asyncState.value.subnets}
                    floatingIps={asyncState.value.floatingIps}
                    values={values}
                  />
                </FormGroup>
              </>
            ) : null}
          </AsyncActionDialog>
        </form>
      )}
    />
  );
};
