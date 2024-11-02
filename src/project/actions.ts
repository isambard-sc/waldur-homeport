import { createFormAction } from '@waldur/redux-form-saga';

export const createProject = createFormAction('waldur/project/CREATE');
export const updateProject = createFormAction('waldur/project/UPDATE');
export const moveProject = createFormAction('waldur/project/MOVE');
