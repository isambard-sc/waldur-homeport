import { SubmissionError } from 'redux-form';
import { takeEvery, put, call, select } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { router } from '@waldur/router';
import { showSuccess, showError } from '@waldur/store/notify';
import { fetchListStart } from '@waldur/table/actions';
import {
  refreshCurrentCustomer,
  setCurrentProject,
} from '@waldur/workspace/actions';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { createProject, updateProject, moveProject } from './actions';
import * as api from './api';

function* handleCreateProject(action) {
  const successMessage = translate('Project has been created.');
  const errorMessage = translate('Project could not be created.');

  try {
    const customer = yield select(getCustomer);
    const response = yield call(api.createProject, {
      ...action.payload,
      customer,
    });
    const project = response.data;
    yield call(router.stateService.go, 'project.dashboard', {
      uuid: project.uuid,
    });
    yield put(createProject.success());
    yield put(showSuccess(successMessage));
    yield put(fetchListStart(PROJECTS_LIST));
    // Refresh the current customer to update ui for other modules
    yield put(refreshCurrentCustomer());
  } catch (error) {
    const errorData = error?.response?.data;
    let formError = new SubmissionError({
      _error: errorMessage,
      ...errorData,
    });
    if (error.response && error.response.status === 413) {
      formError = new SubmissionError({
        _error: translate('File too large. Please select a smaller file.'),
        ...errorData,
      });
    }
    yield put(createProject.failure(formError));
  }
}

export function* handleUpdateProject(action) {
  const successMessage = translate('Project has been updated.');
  const errorMessage = translate('Project could not be updated.');

  const uuid = action.payload.uuid;
  const updatedData = action.payload.data;

  try {
    const response = yield call(api.updateProjectPartially, uuid, updatedData);
    const project = response.data;
    yield call(api.dangerouslyUpdateProject, action.payload.cache, project);
    yield put(updateProject.success());
    const currentProject = yield select(getProject);
    if (project.uuid === currentProject.uuid) {
      yield put(setCurrentProject(project));
    }
    yield put(showSuccess(successMessage));
    yield put(fetchListStart(PROJECTS_LIST));
  } catch (error) {
    const errorData = error?.response?.data;
    let formError = new SubmissionError({
      _error: errorMessage,
      ...errorData,
    });
    if (error.response && error.response.status === 413) {
      const imageError = translate(
        'File too large. Please select a smaller file.',
      );
      if (typeof errorData === 'string') {
        formError = new SubmissionError({
          _error: errorMessage,
          image: imageError,
        });
      } else {
        formError = new SubmissionError({
          _error: errorMessage,
          image: imageError,
          ...errorData,
        });
      }
    }
    yield put(updateProject.failure(formError));
  }
}

function* handleMoveProject(action) {
  try {
    yield call(api.moveProject, action.payload);
    yield put(moveProject.success());
    yield put(
      showSuccess(
        translate(
          '{projectName} project has been moved to {organizationName} organization.',
          {
            projectName: action.payload.project.name,
            organizationName: action.payload.organization.name,
          },
        ),
      ),
    );
    yield put(closeModalDialog());
    yield put(fetchListStart(PROJECTS_LIST));
  } catch (error) {
    const errorMessage = `${translate('Project could not be moved.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(moveProject.failure(formError));
  }
}

export default function* projectSaga() {
  yield takeEvery(createProject.REQUEST, handleCreateProject);
  yield takeEvery(updateProject.REQUEST, handleUpdateProject);
  yield takeEvery(moveProject.REQUEST, handleMoveProject);
}
