import { useSelector } from 'react-redux';
import { Form, Field } from 'react-final-form';
import { useMemo, useCallback } from 'react';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { StringField } from '@waldur/form';
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

import { PROJECT_TEMPLATE_FIELD_CONSTRAINTS } from '../constants';

// Validation
const validateRequired = (value: any) =>
    value ? undefined : translate('This field is required.');

const validateMaxLength = (maxLength: number) => (value: string) =>
    value && value.length > maxLength
        ? translate('Value is too long (max {{maxLength}} characters)', { maxLength })
        : undefined;

const composeValidators = (...validators: Array<(value: any) => string | undefined>) =>
    (value: any) => validators.reduce((error, validator) => error || validator(value), undefined);


const INITIAL_VALUES = {
    role_mapping: {},
    allocation_units_mapping: {},
    offerings: [],
} as const;

// Types
interface AttachProjectFormValues {
    name: string;
}

interface AttachManagedProjectDialogProps {
    resolve: {
        refetch: () => Promise<void>;
    };
}


// Main component
export const AttachManagedProjectDialog: React.FC<AttachManagedProjectDialogProps> = ({ resolve }) => {
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

    const handleSubmit = useCallback(async (formValues: AttachProjectFormValues) => {
        try {
            console.log("AttachManagedProjectDialog submitted with values:", formValues);
            showSuccess(translate('Project has been attached.'));
            closeDialog();
            await resolve.refetch();
        } catch (error) {
            showErrorResponse(error, translate('Unable to attach the project.'));
        }
    }, [currentCustomer, showSuccess, showErrorResponse, closeDialog, resolve]);

    // Permission check
    if (!canEditCustomer) {
        return (
            <ModalDialog title={translate('Attach Project')} size="lg">
                <div className="alert alert-danger" role="alert">
                    {translate('You do not have permission to attach projects.')}
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
                        title={translate('Attach Project')}
                        footer={
                            <div className="mb-5 text-end">
                                <SubmitButton
                                    submitting={submitting}
                                    invalid={invalid}
                                    label={translate('Attach')}
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

                    </ModalDialog>
                </form>
            )}
        />
    );
};