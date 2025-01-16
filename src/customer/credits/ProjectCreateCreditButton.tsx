import { SubmissionError } from 'redux-form';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { useNotify } from '@waldur/store/hooks';

import { createProjectCredit } from './api';
import { ProjectCreditFormData } from './types';

const ProjectCreditFormDialog = lazyComponent(() =>
  import('./ProjectCreditFormDialog').then((module) => ({
    default: module.ProjectCreditFormDialog,
  })),
);

export const ProjectCreateCreditButton = ({ refetch }) => {
  const { closeDialog, openDialog } = useModal();
  const { showErrorResponse, showSuccess } = useNotify();
  const openFormDialog = () =>
    openDialog(ProjectCreditFormDialog, {
      size: 'lg',
      formId: 'ProjectCreditCreateForm',
      onSubmit: async (formData) => {
        const payload: ProjectCreditFormData = {
          ...formData,
          project: formData.project.url,
        };
        try {
          await createProjectCredit(payload);
          closeDialog();
          refetch();
          showSuccess(translate('Credit has been created.'));
        } catch (e) {
          showErrorResponse(e, translate('Unable to create a credit'));
          if (e.response && e.response.status === 400) {
            throw new SubmissionError(e.response.data);
          }
        }
      },
    });
  return <AddButton action={openFormDialog} />;
};
