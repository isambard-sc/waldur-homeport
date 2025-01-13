import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { IssueCreateButtonProps } from '../list/IssueCreateButton';
import { ISSUE_IDS } from '../types/constants';

import { IssueCreateForm } from './IssueCreateForm';
import { IssueFormData, IssueRequestPayload } from './types';
import { sendIssueCreateRequest } from './utils';

interface CreateIssueDialogProps {
  resolve: IssueCreateButtonProps;
}

export const IssueCreateDialog: FunctionComponent<CreateIssueDialogProps> = ({
  resolve,
}) => {
  const dispatch = useDispatch();

  const onCreateIssue = async (formData: IssueFormData) => {
    const description = formData.description;

    const payload: IssueRequestPayload = {
      type: formData.type ? formData.type.id : ISSUE_IDS.INFORMATIONAL,
      summary: formData.summary,
      description,
      is_reported_manually: true,
      project: formData.project?.url,
      resource: formData.resource?.url,
    };
    if (formData.resource) {
      payload.resource = formData.resource.url;
    } else if (formData.project) {
      payload.project = formData.project.url;
    } else if (formData.customer) {
      payload.customer = formData.customer.url;
    }

    if (formData.summary) {
      payload.summary = formData.summary;
    }
    if (formData.issueTemplate) {
      payload.template = formData.issueTemplate.url;
    }
    await sendIssueCreateRequest(
      payload,
      dispatch,
      resolve.refetch,
      formData.files,
    );
  };

  return <IssueCreateForm onCreateIssue={onCreateIssue} resolve={resolve} />;
};
