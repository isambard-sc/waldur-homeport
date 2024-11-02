import { createFormAction } from '@waldur/redux-form-saga';

export const updateUser: any = createFormAction('waldur/user/UPDATE');
export const activateUser: any = createFormAction('waldur/user/ACTIVATE');
export const deactivateUser: any = createFormAction('waldur/user/DEACTIVATE');
export const deleteUser: any = createFormAction('waldur/user/DELETE');
