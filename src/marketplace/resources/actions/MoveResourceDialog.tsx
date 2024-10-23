import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { FormContainer, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { moveResource } from '@waldur/marketplace/common/api';
import { Resource } from '@waldur/marketplace/resources/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { MOVE_RESOURCE_FORM_ID } from './constants';
import { MoveToProjectAutocomplete } from './MoveToProjectAutocomplete';

interface MoveResourceDialogOwnProps {
  resource: Resource;
  refetch?(): void;
}

interface FormData {
  project: { name: string; customer_name: string; url: string };
}

const PureMoveResourceDialog: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();

  const submitRequest = async (formData: FormData) => {
    try {
      await moveResource(
        props.resolve.resource.marketplace_resource_uuid,
        formData.project.url,
      );
      dispatch(
        showSuccess(
          translate(
            '{resourceName} resource has been moved to {projectName} project.',
            {
              resourceName: props.resolve.resource.name,
              projectName: formData.project.name,
            },
          ),
        ),
      );
      if (props.resolve.refetch) {
        await props.resolve.refetch();
      }
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to move resource.')));
    }
  };

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate(
          'Move resource {resourceName} from {projectName} ({customerName})',
          {
            resourceName: props.resolve.resource.name,
            projectName: props.resolve.resource.project_name,
            customerName: props.resolve.resource.customer_name,
          },
        )}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={props.submitting}
              label={translate('Save')}
              disabled={props.invalid}
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          <MoveToProjectAutocomplete isDisabled={props.submitting} />
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

export const MoveResourceDialog = reduxForm<
  FormData,
  MoveResourceDialogOwnProps
>({
  form: MOVE_RESOURCE_FORM_ID,
})(PureMoveResourceDialog);
