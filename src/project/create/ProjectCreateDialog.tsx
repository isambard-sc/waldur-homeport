import { PlusCircle } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { Form } from 'react-final-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { Customer } from '@waldur/workspace/types';

import { createProject, ProjectInput } from '../api';

import { DescriptionGroup } from './DescriptionGroup';
import { EndDateGroup } from './EndDateGroup';
import { ImageGroup } from './ImageGroup';
import { IndustryGroup } from './IndustryGroup';
import { NameGroup } from './NameGroup';
import { OecdCodeGroup } from './OecdCodeGroup';
import { OrganizationGroup } from './OrganizationGroup';
import { StartDateGroup } from './StartDateGroup';
import { TypeGroup } from './TypeGroup';

interface ProjectCreateDialogProps {
  customer?: Customer;
  refetch?: () => void;
}

export const ProjectCreateDialog = ({
  customer,
  refetch,
}: ProjectCreateDialogProps) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
  const router = useRouter();

  const onSubmit = async (formData: ProjectInput) => {
    try {
      const response = await createProject(formData);
      if (refetch) {
        await refetch();
      }
      showSuccess(translate('Project has been created.'));
      closeDialog();
      router.stateService.go('project.dashboard', {
        uuid: response.data.uuid,
      });
    } catch (e) {
      showErrorResponse(e, translate('Unable to create project.'));
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ customer }}
      render={({ handleSubmit, submitting, invalid, dirty, values }) => (
        <form onSubmit={handleSubmit}>
          <MetronicModalDialog
            title={translate('Create project')}
            subtitle={translate(
              'Provide the required information to set up a new project.',
            )}
            iconNode={<PlusCircle weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  disabled={invalid || !dirty}
                  submitting={submitting}
                  label={translate('Create')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <div className="size-lg">
              <OrganizationGroup isDisabled={!!customer} />
              <NameGroup customer={values?.customer} />
              <DescriptionGroup create />
              <IndustryGroup />
              <OecdCodeGroup />
              <TypeGroup create />
              <StartDateGroup create />
              <EndDateGroup create />
              <ImageGroup create />
            </div>
          </MetronicModalDialog>
        </form>
      )}
    />
  );
};
