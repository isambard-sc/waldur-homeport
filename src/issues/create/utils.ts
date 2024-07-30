import { triggerTransition } from '@uirouter/redux';

import { post } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { putAttachment } from '@waldur/issues/attachments/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { IssueRequestPayload, IssueResponse } from './types';

export const sendIssueCreateRequest = async (
  payload: IssueRequestPayload,
  dispatch,
  refetch,
  files?: FileList,
) => {
  try {
    const response = await post<IssueResponse>('/support-issues/', payload);
    const issue = response.data;
    if (files) {
      await Promise.all(
        Array.from(files).map((file) => putAttachment(issue.url, file)),
      );
    }
    dispatch(
      showSuccess(
        translate('Request {requestId} has been created.', {
          requestId: issue.key,
        }),
      ),
    );
    refetch();
    dispatch(triggerTransition('support.detail', { uuid: issue.uuid }));
    dispatch(closeModalDialog());
  } catch (e) {
    dispatch(showErrorResponse(e, translate('Unable to create request.')));
    refetch();
  }
};
