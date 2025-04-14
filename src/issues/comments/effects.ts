import { call, put, takeEvery } from 'redux-saga/effects';
import { supportCommentsDestroy, supportCommentsList } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { showErrorResponse } from '@waldur/store/notify';

import * as actions from './actions';
import * as constants from './constants';

function* issueCommentsGet(action) {
  const { issueUrl } = action.payload;
  try {
    const response = yield call(supportCommentsList, {
      query: { issue: issueUrl },
    });
    yield put(actions.issueCommentsGetSuccess(response.data));
  } catch (error) {
    yield put(actions.issueCommentsGetError(error));
    yield put(showErrorResponse(error, translate('Unable to fetch comments.')));
  }
}

function* issueCommentsDelete(action) {
  const { commentId } = action.payload;
  try {
    yield call(supportCommentsDestroy, { path: { uuid: commentId } });
    yield put(actions.issueCommentsDeleteSuccess(commentId));
  } catch (error) {
    yield put(actions.issueCommentsDeleteError(error, commentId));
    yield put(showErrorResponse(error, translate('Unable to delete comment.')));
  }
}

export default function* () {
  yield takeEvery(constants.ISSUE_COMMENTS_GET, issueCommentsGet);
  yield takeEvery(constants.ISSUE_COMMENTS_DELETE, issueCommentsDelete);
}
