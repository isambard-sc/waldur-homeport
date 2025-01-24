import { translate } from '@waldur/i18n';
import { putAttachment } from '@waldur/issues/attachments/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { router } from '@waldur/router';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { createIssue } from '../api';

import { IssueRequestPayload } from './types';

export const sendIssueCreateRequest = async (
  payload: IssueRequestPayload,
  dispatch,
  refetch?,
  files?: FileList,
) => {
  try {
    const issue = await createIssue(payload);
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
    if (refetch) refetch();
    router.stateService.go('support.detail', { uuid: issue.uuid });
    dispatch(closeModalDialog());
  } catch (e) {
    dispatch(showErrorResponse(e, translate('Unable to create request.')));
    if (refetch) refetch();
  }
};
