import { Field, Form } from 'react-final-form';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { NumberField, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { getCustomer, getUser } from '@waldur/workspace/selectors';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

import { RoleMappingField } from './RoleMappingField';
import { OrganizationAutocompleteField } from './OrganizationAutocompleteField';
import { OfferingAutocompleteField } from './OfferingAutocompleteField';

import { get } from '@waldur/core/api';

const projectClassPartialUpdate = (params) => {
  console.log('Updating project class with params:', params);
  return null;
}

const projectClassGet = async (uuid) => {
  console.log('Fetching project class with uuid:', uuid);

  return await get(`/openportal-project-class/${uuid}/`);
}

const MAX_PORTALIDENTIFIER_LENGTH = 32;
const MAX_PROJECTCLASS_LENGTH = 128;
const MAX_PROJECT_SHORTNAME_LENGTH = 30;

interface ProjectClassEditDialogOwnProps {
  resolve: {
    initialValues;
    refetch(): void;
  };
}

export const ProjectClassEditDialog = ({
  resolve,
}: ProjectClassEditDialogOwnProps) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();

  const currentCustomer = useSelector(getCustomer);
  const user = useSelector(getUser);

  const canEditCustomer = hasPermission(user, {
    permission: PermissionEnum.UPDATE_CUSTOMER,
    customerId: currentCustomer.uuid,
  });

  if (!canEditCustomer) {
    return (
      <ModalDialog title={translate('Edit project class')}>
        <div className="text-danger">
          {translate('You do not have permission to edit this project class.')}
        </div>
      </ModalDialog>
    );
  }

  const [projectClass, setProjectClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectClass = async () => {
      try {
        setLoading(true);
        const data = await projectClassGet(resolve.initialValues.uuid);
        if (!data) {
          throw new Error(translate('Project class not found.'));
        }

        data.customer = data.customer_data;
        data.provider = data.provider_data;
        data.offerings = data.offerings_data || [];
        data.role_mapping = data.role_mapping_data || {};

        console.log('Fetched project class:', data);

        setProjectClass(data);
      } catch (err) {
        setError(err);
        showErrorResponse(err, translate('Unable to fetch project class details.'));
      } finally {
        setLoading(false);
      }
    };

    fetchProjectClass();
  }, [resolve.initialValues.uuid]);

  if (loading) {
    return (
      <ModalDialog title={translate('Edit project class')}>
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  if (error || !projectClass) {
    return (
      <ModalDialog title={translate('Edit project class')}>
        <div className="text-danger">
          {translate('Error loading project class details.')}
        </div>
      </ModalDialog>
    );
  }

  const onSubmit = async (formValues) => {
    try {
      await projectClassPartialUpdate({
        path: { uuid: formValues.uuid },
        body: {
          provider: currentCustomer,
          name: formValues.name,
          portal: formValues.portal,
          customer: formValues.customer,
          shortname: formValues.shortname,
          offerings: formValues.offerings,
          approval_limit: formValues.approval_limit,
          max_credit_limit: formValues.max_credit_limit,
          role_mapping: formValues.role_mapping,
        },
      });
      showSuccess(translate('Project class has been updated'));
      closeDialog();
      await resolve.refetch();
    } catch (error) {
      showErrorResponse(error, translate('Unable to update the project class.'));
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={projectClass}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit project class')}
            footer={
              <div className="mb-5 text-end">
                <SubmitButton
                  submitting={submitting}
                  invalid={invalid}
                  label={translate('Save')}
                />
              </div>
            }
          >
            <FormGroup controlId="name" label={translate('Name of project class')} required>
              <Field
                name="name"
                component={StringField as any}
                placeholder={translate('e.g., my-project-class')}
                maxLength={MAX_PROJECTCLASS_LENGTH}
                required
              />
            </FormGroup>

            <FormGroup controlId="portal" label={translate('Portal from which requests are allowed')} required>
              <Field
                name="portal"
                component={StringField as any}
                placeholder={translate('Portal identifier')}
                maxLength={MAX_PORTALIDENTIFIER_LENGTH}
                required
              />
            </FormGroup>

            <FormGroup controlId="customer" label={translate('Organisation into which to deploy projects')} required>
              <OrganizationAutocompleteField
                name="customer"
                placeholder={translate('Select organisation')}
              />
            </FormGroup>

            <FormGroup controlId="shortname" label={translate('Pattern used to generate project shortnames')}>
              <Field
                name="shortname"
                component={StringField as any}
                placeholder={translate('e.g., a{year}{count}')}
                maxLength={MAX_PROJECT_SHORTNAME_LENGTH}
                help={translate('Use {year} for last digit of year and {count} for sequential letter (a, b, c, etc.)')}
                required
              />
            </FormGroup>

            <FormGroup controlId="offerings" label={translate('Default offerings for new projects')}>
              <OfferingAutocompleteField
                name="offerings"
                placeholder={translate('Select offerings')}
                isMulti={true}
                reactSelectProps={{
                  isClearable: true,
                  closeMenuOnSelect: false
                }}
              />
            </FormGroup>

            <FormGroup controlId="role_mapping" label={translate('Role Mapping')}>
              <RoleMappingField
                name="role_mapping"
                placeholder={translate('Map remote portal roles to local roles')}
              />
            </FormGroup>

            <FormGroup controlId="approval_limit" label={translate('Credit limit beyond which approval is required')}>
              <Field
                name="approval_limit"
                component={NumberField as any}
                placeholder={translate('e.g., 1000.00')}
                step="0.01"
                min="0"
                help={translate('Credit limit beyond which requests need local admin approval. Leave empty for no approval required, set to 0 for all requests to require approval.')}
              />
            </FormGroup>

            <FormGroup controlId="max_credit_limit" label={translate('Maximum credit request limit for projects in this class')}>
              <Field
                name="max_credit_limit"
                component={NumberField as any}
                placeholder={translate('e.g., 10000.00')}
                step="0.01"
                min="0"
                help={translate('Maximum credit limit for projects in this class. Requests beyond this are automatically rejected. Leave empty for no maximum limit, set to 0 to prevent project creation.')}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};