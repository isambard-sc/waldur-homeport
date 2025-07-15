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


const projectClassCreate = (params) => {
    console.log('Creating project class with params:', params);
    return null;
}

const MAX_PORTALIDENTIFIER_LENGTH = 32;
const MAX_PROJECTCLASS_LENGTH = 128;
const MAX_PROJECT_SHORTNAME_LENGTH = 30;


export const ProjectClassCreateDialog = ({ resolve }) => {
    const { showErrorResponse, showSuccess } = useNotify();
    const { closeDialog } = useModal();

    const currentCustomer = useSelector(getCustomer);
    const user = useSelector(getUser);

    const canEditCustomer = hasPermission(user, {
        permission: PermissionEnum.UPDATE_CUSTOMER,
        customerId: currentCustomer.uuid,
    });

    console.log('Current customer:', currentCustomer);
    console.log('User:', user);
    if (!canEditCustomer) {
        showErrorResponse(null, translate('You do not have permission to create a project class.'));
        return null;
    }

    const onSubmit = async (formValues) => {
        try {
            await projectClassCreate({
                body: {
                    provider: currentCustomer,
                    name: formValues.name,
                    portal: formValues.portal,
                    //customer: formValues.customer,
                    shortname: formValues.shortname,
                    approval_limit: formValues.approval_limit,
                    max_credit_limit: formValues.max_credit_limit,
                },
            });
            showSuccess(translate('Project class has been created'));
            closeDialog();
            await resolve.refetch();
        } catch (error) {
            showErrorResponse(error, translate('Unable to create the project class.'));
        }
    };

    return (
        <Form
            onSubmit={onSubmit}
            render={({ handleSubmit, submitting, invalid }) => (
                <form onSubmit={handleSubmit}>
                    <ModalDialog
                        title={translate('Create a project class')}
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
                        <FormGroup controlId="name" label={translate('Name')} required>
                            <Field
                                name="name"
                                component={StringField as any}
                                placeholder={translate('e.g., my-project-class')}
                                maxLength={MAX_PROJECTCLASS_LENGTH}
                                required
                            />
                        </FormGroup>

                        <FormGroup controlId="portal" label={translate('Portal')} required>
                            <Field
                                name="portal"
                                component={StringField as any}
                                placeholder={translate('Portal identifier')}
                                maxLength={MAX_PORTALIDENTIFIER_LENGTH}
                                required
                            />
                        </FormGroup>

                        <FormGroup controlId="shortname" label={translate('Shortname Pattern')}>
                            <Field
                                name="shortname"
                                component={StringField as any}
                                placeholder={translate('e.g., a{year}{count}')}
                                maxLength={MAX_PROJECT_SHORTNAME_LENGTH}
                                help={translate('Use {year} for last digit of year and {count} for sequential letter (a, b, c, etc.)')}
                                required
                            />
                        </FormGroup>

                        <FormGroup controlId="approval_limit" label={translate('Approval Limit')}>
                            <Field
                                name="approval_limit"
                                component={NumberField as any}
                                placeholder={translate('e.g., 1000.00')}
                                step="0.01"
                                min="0"
                                help={translate('Credit limit beyond which requests need local admin approval. Leave empty for no approval required, set to 0 for all requests to require approval.')}
                            />
                        </FormGroup>

                        <FormGroup controlId="max_credit_limit" label={translate('Maximum Credit Limit')}>
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
