import { useSelector } from 'react-redux';
import { Form, Field } from 'react-final-form';
import { useMemo, useCallback } from 'react';

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
import { PROJECT_TEMPLATE_FIELD_CONSTRAINTS } from '../constants';


const INITIAL_VALUES = {
    role_mapping: {},
    allocation_units_mapping: {},
    offerings: [],
} as const;

// Types
interface ProjectTemplateFormValues {
    name: string;
    portal: string;
    customer: any;
    shortname: string;
    offerings?: any[];
    approval_limit?: number;
    max_credit_limit?: number;
    role_mapping?: Record<string, any>;
    allocation_units_mapping?: Record<string, number>;
}

interface ProjectTemplateCreateDialogProps {
    resolve: {
        refetch: () => Promise<void>;
    };
}

// Validation
const validateRequired = (value: any) =>
    value ? undefined : translate('This field is required.');

const validateMaxLength = (maxLength: number) => (value: string) =>
    value && value.length > maxLength
        ? translate('Value is too long (max {{maxLength}} characters)', { maxLength })
        : undefined;

const validatePositiveNumber = (value: number) =>
    value < 0 ? translate('Value must be positive') : undefined;

const composeValidators = (...validators: Array<(value: any) => string | undefined>) =>
    (value: any) => validators.reduce((error, validator) => error || validator(value), undefined);

// API function
const createProjectTemplate = async (formData: ProjectTemplateFormValues, currentCustomer: any) => {
    const payload = {
        provider: getCustomerURL(currentCustomer),
        name: formData.name,
        portal: formData.portal,
        customer: getCustomerURL(formData.customer),
        shortname: formData.shortname,
        offerings: formData.offerings?.map((offering) => offering.url) || [],
        approval_limit: formData.approval_limit,
        max_credit_limit: formData.max_credit_limit,
        role_mapping: formData.role_mapping || {},
        allocation_units_mapping: formData.allocation_units_mapping || {},
    };

    return post('/openportal-project-template/', payload);
};

// Main component
export const ProjectTemplateCreateDialog: React.FC<ProjectTemplateCreateDialogProps> = ({ resolve }) => {
    const { showErrorResponse, showSuccess } = useNotify();
    const { closeDialog } = useModal();
    const currentCustomer = useSelector(getCustomer);
    const user = useSelector(getUser);

    const canEditCustomer = useMemo(() =>
        hasPermission(user, {
            permission: PermissionEnum.UPDATE_CUSTOMER,
            customerId: currentCustomer?.uuid,
        }),
        [user, currentCustomer?.uuid]
    );

    const handleSubmit = useCallback(async (formValues: ProjectTemplateFormValues) => {
        try {
            await createProjectTemplate(formValues, currentCustomer);
            showSuccess(translate('Project template has been created'));
            closeDialog();
            await resolve.refetch();
        } catch (error) {
            showErrorResponse(error, translate('Unable to create the project template.'));
        }
    }, [currentCustomer, showSuccess, showErrorResponse, closeDialog, resolve]);

    // Permission check
    if (!canEditCustomer) {
        return (
            <ModalDialog title={translate('Create project template')}>
                <div className="alert alert-danger" role="alert">
                    {translate('You do not have permission to create a project template.')}
                </div>
            </ModalDialog>
        );
    }

    return (
        <Form
            onSubmit={handleSubmit}
            initialValues={INITIAL_VALUES}
            subscription={{ submitting: true, invalid: true, pristine: true }}
            render={({ handleSubmit, submitting, invalid, pristine }) => (
                <form onSubmit={handleSubmit} noValidate>
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
                        <FormGroup
                            controlId="name"
                            label={translate('Name of project template')}
                            required
                        >
                            <Field
                                name="name"
                                component={StringField}
                                placeholder={translate('e.g., my-project-template')}
                                maxLength={PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_PROJECTCLASS_LENGTH}
                                validate={composeValidators(
                                    validateRequired,
                                    validateMaxLength(PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_PROJECTCLASS_LENGTH)
                                )}
                                required
                            />
                        </FormGroup>

                        <FormGroup
                            controlId="portal"
                            label={translate('Portal from which requests are allowed')}
                            required
                        >
                            <Field
                                name="portal"
                                component={StringField}
                                placeholder={translate('Portal identifier')}
                                maxLength={PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_PORTALIDENTIFIER_LENGTH}
                                validate={composeValidators(
                                    validateRequired,
                                    validateMaxLength(PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_PORTALIDENTIFIER_LENGTH)
                                )}
                                required
                            />
                        </FormGroup>

                        <FormGroup
                            controlId="customer"
                            label={translate('Organisation into which to deploy projects')}
                            required
                        >
                            <Field
                                name="customer"
                                component={OrganizationAutocompleteField}
                                placeholder={translate('Select organisation')}
                                validate={validateRequired}
                                required
                                reactSelectProps={{
                                    isClearable: true,
                                    closeMenuOnSelect: true,
                                }}
                                noOptionsMessage={() => translate('No organisations found')}
                            />
                        </FormGroup>

                        <FormGroup
                            controlId="shortname"
                            label={translate('Pattern used to generate project shortnames')}
                            required
                        >
                            <Field
                                name="shortname"
                                component={StringField}
                                placeholder={translate('e.g., a{year}{count}')}
                                maxLength={PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_PROJECT_SHORTNAME_LENGTH}
                                validate={composeValidators(
                                    validateRequired,
                                    validateMaxLength(PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_PROJECT_SHORTNAME_LENGTH)
                                )}
                                help={translate('Use {year} for last digit of year and {count} for sequential letter (a, b, c, etc.)')}
                                required
                            />
                        </FormGroup>

                        <FormGroup
                            controlId="offerings"
                            label={translate('Default offerings for new projects')}
                        >
                            <Field
                                name="offerings"
                                component={OfferingAutocompleteField}
                                placeholder={translate('Select offerings')}
                                isMulti={true}
                                reactSelectProps={{
                                    isClearable: true,
                                    closeMenuOnSelect: false,
                                }}
                                noOptionsMessage={() => translate('No offerings found')}
                            />
                        </FormGroup>

                        <FormGroup
                            controlId="role_mapping"
                            label={translate('Role Mapping')}
                        >
                            <Field
                                name="role_mapping"
                                component={RoleMappingField}
                                placeholder={translate('Map remote portal roles to local roles')}
                                help={translate('Map remote portal roles to local roles. For example, map "admin" to "Project Manager" and "user" to "Project Member".')}
                            />
                        </FormGroup>

                        <FormGroup
                            controlId="allocation_units_mapping"
                            label={translate('Allocation credit mapping')}
                        >
                            <Field
                                name="allocation_units_mapping"
                                component={AllocationUnitsMappingField}
                                placeholder={translate('Map allocation units to credits')}
                                help={translate('Map allocation units to credits. For example, 1 credit is 4 GPU hours.')}
                            />
                        </FormGroup>

                        <FormGroup
                            controlId="approval_limit"
                            label={translate('Credit limit beyond which approval is required')}
                        >
                            <Field
                                name="approval_limit"
                                component={NumberField}
                                placeholder={translate('e.g., 1000.00')}
                                step="0.01"
                                min="0"
                                validate={validatePositiveNumber}
                                help={translate('Credit limit beyond which requests need local admin approval. Leave empty for no approval required, set to 0 for all requests to require approval.')}
                            />
                        </FormGroup>

                        <FormGroup
                            controlId="max_credit_limit"
                            label={translate('Maximum credit request limit for projects using this template')}
                        >
                            <Field
                                name="max_credit_limit"
                                component={NumberField}
                                placeholder={translate('e.g., 10000.00')}
                                step="0.01"
                                min="0"
                                validate={validatePositiveNumber}
                                help={translate('Maximum credit limit for projects using this template. Requests beyond this are automatically rejected. Leave empty for no maximum limit, set to 0 to prevent project creation.')}
                            />
                        </FormGroup>
                    </ModalDialog>
                </form>
            )}
        />
    );
};