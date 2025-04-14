import { call, put, race, select, spawn, takeEvery } from 'redux-saga/effects';
import {
  supportAttachmentsCreate,
  supportAttachmentsDestroy,
  supportAttachmentsList,
} from 'waldur-js-client';

import { formDataOptions } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';
import { showError, showErrorResponse } from '@waldur/store/notify';

import * as actions from './actions';
import * as constants from './constants';
import { getDeleting } from './selectors';
import * as utils from './utils';

function* issueAttachmentsGet(action) {
  const { issueUrl } = action.payload;
  try {
    const response = yield call(supportAttachmentsList, {
      query: { issue: issueUrl },
    });
    const data = response.data.sort((a, b) => (a.created > b.created ? -1 : 1));
    yield put(actions.issueAttachmentsGetSuccess(data));
  } catch (error) {
    yield put(actions.issueAttachmentsGetError(error));
    yield put(
      showErrorResponse(error, translate('Unable to fetch attachment.')),
    );
  }
}

function* issueAttachmentUpload(action) {
  const { issueUrl, file } = action.payload;
  const { cancel } = yield race({
    sync: call(function* () {
      try {
        const response = yield call(supportAttachmentsCreate, {
          body: { issue: issueUrl, file },
          ...formDataOptions,
        });
        yield put(actions.issueAttachmentsPutSuccess(response.data));
      } catch (error) {
        yield put(actions.issueAttachmentsPutError(file, error));
        yield put(
          showErrorResponse(error, translate('Unable to upload attachment.')),
        );
      }
    }),
  });
  if (cancel) {
    yield put(actions.issueAttachmentsPutReject(file));
  }
}

function* issueAttachmentsPut(action) {
  const { issueUrl, files } = action.payload;
  const { accepted, rejected } = yield call(
    utils.validateFiles,
    files,
    ENV.excludedAttachmentTypes,
  );

  if (rejected.length) {
    const message = utils.getErrorMessage(rejected);
    yield put(showError(message));
  }
  yield put(actions.issueAttachmentsPutStart(accepted));
  for (const file of accepted) {
    yield spawn(issueAttachmentUpload, { payload: { issueUrl, file } });
  }
}

function* issueAttachmentsDelete(action) {
  const { uuid } = action.payload;
  const deleting = yield select(getDeleting);
  if (deleting[uuid]) {
    return;
  }
  try {
    yield put(actions.issueAttachmentsDeleteStart(uuid));
    yield call(supportAttachmentsDestroy, { path: { uuid } });
    yield put(actions.issueAttachmentsDeleteSuccess(uuid));
  } catch (error) {
    yield put(actions.issueAttachmentsDeleteError(error, uuid));
    yield put(
      showErrorResponse(error, translate('Unable to delete attachment.')),
    );
  }
}

export default function* () {
  yield takeEvery(constants.ISSUE_ATTACHMENTS_GET, issueAttachmentsGet);
  yield takeEvery(constants.ISSUE_ATTACHMENTS_PUT, issueAttachmentsPut);
  yield takeEvery(constants.ISSUE_ATTACHMENTS_PUT_RETRY, issueAttachmentUpload);
  yield takeEvery(constants.ISSUE_ATTACHMENTS_DELETE, issueAttachmentsDelete);
}
