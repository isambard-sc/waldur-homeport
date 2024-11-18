import { pick } from 'es-toolkit/compat';
import { Field, Form } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';

import { SubmitButton } from '@waldur/form';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { setCurrentProject } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { updateProject } from '../api';
import { DescriptionGroup } from '../create/DescriptionGroup';
import { EndDateGroup } from '../create/EndDateGroup';
import { IndustryGroup } from '../create/IndustryGroup';
import { NameGroup } from '../create/NameGroup';
import { OecdCodeGroup } from '../create/OecdCodeGroup';
import { StartDateGroup } from '../create/StartDateGroup';
import { EditProjectProps } from '../types';

export const EditFieldDialog = ({ resolve }: { resolve: EditProjectProps }) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const { showSuccess, showErrorResponse } = useNotify();

  const onSubmit = async (data: FormData) => {
    try {
      const project = await updateProject(resolve.project.uuid, data);
      dispatch(setCurrentProject(project.data as Project));
      showSuccess(translate('Project has been updated.'));
      dispatch(closeModalDialog());
    } catch (e) {
      showErrorResponse(e, translate('Project could not be updated.'));
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={pick(resolve.project, resolve.name)}
      subscription={{
        values: true,
        invalid: true,
        dirty: true,
        submitting: true,
      }}
    >
      {({ invalid, handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            headerLess
            bodyClassName="pb-2"
            footerClassName="border-0 pt-0 gap-2"
            footer={
              <>
                <CloseDialogButton className="flex-grow-1" />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-grow-1"
                />
              </>
            }
          >
            {resolve.name === 'customer_name' ? (
              <FormGroup label={translate('Project owner')}>
                <Field
                  component={StringField as any}
                  name="customer_name"
                  disabled
                />
              </FormGroup>
            ) : resolve.name === 'name' ? (
              <NameGroup customer={customer} />
            ) : resolve.name === 'description' ? (
              <DescriptionGroup />
            ) : resolve.name === 'is_industry' ? (
              <IndustryGroup />
            ) : resolve.name === 'start_date' ? (
              <StartDateGroup />
            ) : resolve.name === 'end_date' ? (
              <EndDateGroup />
            ) : resolve.name === 'oecd_fos_2007_code' ? (
              <OecdCodeGroup />
            ) : resolve.name === 'backend_id' ? (
              <FormGroup label={translate('Backend ID')}>
                <Field component={StringField as any} name="backend_id" />
              </FormGroup>
            ) : resolve.name === 'slug' ? (
              <FormGroup label={translate('Slug')}>
                <Field component={StringField as any} name="slug" />
              </FormGroup>
            ) : null}
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
