import { useSelector } from 'react-redux';
import { Form, Field } from 'react-final-form';
import { useMemo, useCallback } from 'react';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { getCustomer, getUser } from '@waldur/workspace/selectors';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse } from '@waldur/store/notify';
import { attachProjectToManagedProject } from '../api';

import { ProjectAutocompleteField } from './ProjectAutocompleteField';


const INITIAL_VALUES = {
    project: null,
} as const;

const validateRequired = (value: any) =>
    value ? undefined : translate('This field is required.');


// Types
interface AttachProjectFormValues {
    project: any;
}

interface AttachManagedProjectDialogProps {
    resolve: {
        refetch: () => Promise<void>;
    };
}

// Main component
export const AttachManagedProjectDialog: React.FC<AttachManagedProjectDialogProps> = ({ project, resolve, title }) => {
    if (!project) {
        return (
            <ModalDialog title={translate('Attach Project')} size="lg">
                <div className="alert alert-danger" role="alert">
                    {translate('Managed Project is not available.')}
                </div>
            </ModalDialog>
        );
    }

    const { showErrorResponse, showSuccess } = useNotify();
    const { closeDialog } = useModal();
    const currentCustomer = useSelector(getCustomer);
    const user = useSelector(getUser);

    const projectTemplate = useMemo(() => {
        return project?.project_template_data;
    }, [project?.project_template_data]);

    if (!projectTemplate) {
        return (
            <ModalDialog title={translate('Attach Project')} size="lg">
                <div className="alert alert-danger" role="alert">
                    {translate('Project template data is not available.')}
                </div>
            </ModalDialog>
        );
    }

    const targetCustomer = useMemo(() => {
        return projectTemplate?.customer_data;
    }, [projectTemplate?.customer_data]);

    if (!targetCustomer) {
        return (
            <ModalDialog title={translate('Attach Project')} size="lg">
                <div className="alert alert-danger" role="alert">
                    {translate('Customer Organization into which to create the project is not available.')}
                </div>
            </ModalDialog>
        );
    }

    const canEditCustomer = useMemo(() =>
        hasPermission(user, {
            permission: PermissionEnum.UPDATE_CUSTOMER,
            customerId: currentCustomer?.uuid,
        }),
        [user, currentCustomer?.uuid]
    );

    const canEditTargetCustomer = useMemo(() =>
        hasPermission(user, {
            permission: PermissionEnum.UPDATE_CUSTOMER,
            customerId: targetCustomer?.uuid,
        }),
        [user, targetCustomer?.uuid]
    );

    const handleSubmit = useCallback(async (formValues: AttachProjectFormValues) => {
        try {
            await attachProjectToManagedProject(project, formValues.project);
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
                    {translate('You do not have permission to edit ManagedProjects in {customer}.', { customer: currentCustomer?.name })}
                </div>
            </ModalDialog>
        );
    }

    if (!canEditTargetCustomer) {
        return (
            <ModalDialog title={translate('Attach Project')} size="lg">
                <div className="alert alert-danger" role="alert">
                    {translate('You do not have permission to attach projects from {customer}.', { customer: targetCustomer?.name })}
                </div>
            </ModalDialog>
        );
    }

    const query = useMemo(() => ({
        customer: targetCustomer?.uuid,
        field: ['name', 'uuid'],
        o: 'name',
    }), [targetCustomer?.uuid]);

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
                            controlId="project"
                            label={translate('Choose a project to attach. Note that only unmanaged projects in {customer} can be attached.', { customer: targetCustomer?.name })}
                            required
                        >
                            <Field
                                name="project"
                                component={ProjectAutocompleteField}
                                placeholder={translate('Select project')}
                                validate={validateRequired}
                                query={query}
                                required
                                reactSelectProps={{
                                    isClearable: true,
                                    closeMenuOnSelect: true,
                                }}
                                noOptionsMessage={() => translate('No projects found')}
                                required
                            />
                        </FormGroup>

                    </ModalDialog>
                </form>
            )}
        />
    );
};