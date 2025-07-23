import { useSelector } from 'react-redux';
import { Form, Field } from 'react-final-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { NumberField, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { getCustomer, getUser } from '@waldur/workspace/selectors';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse } from '@waldur/store/notify';
import { post } from '../api';
import { getCustomerURL } from '../utils';

import { RoleMappingField } from './RoleMappingField';
import { AllocationUnitsMappingField } from './AllocationUnitsMappingField';
import { OrganizationAutocompleteField } from './OrganizationAutocompleteField';
import { OfferingAutocompleteField } from './OfferingAutocompleteField';

const projectClassCreate = async (params) => {
    const data = {
        provider: getCustomerURL(params.body?.provider),
        name: params.body?.name,
        portal: params.body?.portal,
        customer: getCustomerURL(params.body?.customer),
        shortname: params.body?.shortname,
        offerings: params.body?.offerings?.map((offering) => offering.url) || [],
        approval_limit: params.body?.approval_limit,
        max_credit_limit: params.body?.max_credit_limit,
        role_mapping: params.body?.role_mapping || {},
    };

    await post('/openportal-project-template/', data);

    return null;
}

const MAX_PORTALIDENTIFIER_LENGTH = 32;
const MAX_PROJECTCLASS_LENGTH = 128;
const MAX_PROJECT_SHORTNAME_LENGTH = 30;


export const ProjectTemplateCreateDialog = ({ resolve }) => {
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
            <ModalDialog title={translate('Create project template')}>
                <div className="text-danger">
                    {translate('You do not have permission to create a project template.')}
                </div>
            </ModalDialog>
        );
    }

    const onSubmit = async (formValues) => {
        try {
            await projectClassCreate({
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
            showSuccess(translate('Project template has been created'));
            closeDialog();
            await resolve.refetch();
        } catch (error) {
            showErrorResponse(error, translate('Unable to create the project template.'));
        }
    };

    return (
        <Form
            onSubmit={onSubmit}
            render={({ handleSubmit, submitting, invalid }) => (
                <form onSubmit={handleSubmit}>
                    <ModalDialog
                        title={translate('Create a project template')}
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
                        <FormGroup controlId="name" label={translate('Name of project template')} required>
                            <Field
                                name="name"
                                component={StringField as any}
                                placeholder={translate('e.g., my-project-template')}
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
                            <Field
                                name="customer"
                                component={OrganizationAutocompleteField as any}
                                placeholder={translate('Select organisation')}
                                required
                                reactSelectProps={{
                                    isClearable: true,
                                    closeMenuOnSelect: true,
                                }}
                                noOptionsMessage={() => translate('No organisations found')}
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
                            <Field
                                name="offerings"
                                component={OfferingAutocompleteField as any}
                                placeholder={translate('Select offerings')}
                                isMulti={true}
                                reactSelectProps={{
                                    isClearable: true,
                                    closeMenuOnSelect: false,
                                }}
                                noOptionsMessage={() => translate('No offerings found')}
                            />
                        </FormGroup>

                        {/*                         <FormGroup controlId="role_mapping" label={translate('Role Mapping')}>
                            <Field
                                name="role_mapping"
                                component={RoleMappingField as any}
                                placeholder={translate('Map remote portal roles to local roles')}
                                help={translate('Map remote portal roles to local roles. For example, map "admin" to "Project Manager" and "user" to "Project Member".')}
                            />
                        </FormGroup>*/}

                        <FormGroup controlId="allocation_units_mapping" label={translate('Allocation credit mapping')}>
                            <Field
                                name="allocation_units_mapping"
                                component={AllocationUnitsMappingField as any}
                                placeholder={translate('Map allocation units to credits')}
                                help={translate('Map allocation units to credits. For example, 1 credit is 4 GPU hours.')}
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

                        <FormGroup controlId="max_credit_limit" label={translate('Maximum credit request limit for projects using this template')}>
                            <Field
                                name="max_credit_limit"
                                component={NumberField as any}
                                placeholder={translate('e.g., 10000.00')}
                                step="0.01"
                                min="0"
                                help={translate('Maximum credit limit for projects using this template. Requests beyond this are automatically rejected. Leave empty for no maximum limit, set to 0 to prevent project creation.')}
                            />
                        </FormGroup>
                    </ModalDialog>
                </form >
            )}
        />
    );
};
