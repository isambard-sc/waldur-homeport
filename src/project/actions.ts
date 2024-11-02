import { createFormAction } from '@waldur/redux-form-saga';

export const createProject: any = createFormAction('waldur/project/CREATE');
export const updateProject: any = createFormAction('waldur/project/UPDATE');
export const moveProject: any = createFormAction('waldur/project/MOVE');
