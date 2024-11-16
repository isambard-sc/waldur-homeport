import {
  SET_CURRENT_CUSTOMER,
  SET_CURRENT_PROJECT,
  SET_CURRENT_RESOURCE,
  SET_CURRENT_USER,
} from './constants';
import { Project } from './types';

export const setCurrentCustomer = (customer) => ({
  type: SET_CURRENT_CUSTOMER,
  payload: {
    customer,
  },
});

export const setCurrentProject = (project: Project) => ({
  type: SET_CURRENT_PROJECT,
  payload: {
    project,
  },
});

export const setCurrentUser = (user, impersonated = false) => ({
  type: SET_CURRENT_USER,
  payload: {
    user,
    impersonated,
  },
});

export const setCurrentResource = (resource) => ({
  type: SET_CURRENT_RESOURCE,
  payload: {
    resource,
  },
});
