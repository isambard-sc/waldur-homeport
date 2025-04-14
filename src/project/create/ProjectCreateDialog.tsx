import { PlusCircle } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { Form } from 'react-final-form';
import { projectsCreate } from 'waldur-js-client';

import { formDataOptions, fileSerializer } from '@waldur/core/api';
import { formatDate } from '@waldur/core/dateUtils';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { Customer } from '@waldur/workspace/types';

import { ProjectShortNameGroup } from './ProjectShortNameGroup';
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

interface ProjectFormData {
  name: string;
  description: string;
  short_name?: string;
  end_date?: Date;
  start_date?: Date;
  customer: { url: string };
  type?: { url: string };
  oecd_fos_2007_code?: { value: string };
  is_industry: boolean;
  image?: File | Blob;
}

export const ProjectCreateDialog = ({
  customer,
  refetch,
}: ProjectCreateDialogProps) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
  const router = useRouter();

  const onSubmit = async (formData: ProjectFormData) => {
    try {
      const response = await projectsCreate({
        body: {
          name: formData.name,
          description: formData.description,
          short_name: formData.short_name,
          end_date: formData.end_date
            ? formatDate(formData.end_date)
            : undefined,
          start_date: formData.start_date
            ? formatDate(formData.start_date)
            : undefined,
          customer: formData.customer.url,
          type: formData.type?.url,
          oecd_fos_2007_code: formData.oecd_fos_2007_code?.value,
          is_industry: formData.is_industry,
          image: fileSerializer(formData.image),
        },
        ...formDataOptions,
      });
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
          <ModalDialog
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
              <ProjectShortNameGroup isDisabled={!!customer} />
              <DescriptionGroup create />
              <IndustryGroup />
              <OecdCodeGroup />
              <TypeGroup create />
              <StartDateGroup create />
              <EndDateGroup create />
              <ImageGroup create />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
