import {
  SET_CURRENT_CUSTOMER,
  SET_CURRENT_PROJECT,
  SET_CURRENT_RESOURCE,
  SET_CURRENT_USER,
} from './constants';
import { WorkspaceState } from './types';

const INITIAL_STATE: WorkspaceState = {
  user: undefined,
  impersonatorUser: undefined,
  customer: undefined,
  project: undefined,
  resource: undefined,
};

export const reducer = (state = INITIAL_STATE, action): WorkspaceState => {
  switch (action.type) {
    case SET_CURRENT_CUSTOMER:
      return {
        ...state,
        customer: action.payload.customer,
      };

    case SET_CURRENT_PROJECT:
      return {
        ...state,
        project: action.payload.project,
      };

    case SET_CURRENT_USER:
      if (!action.payload.impersonated) {
        return {
          ...state,
          impersonatorUser: undefined,
          user: action.payload.user,
        };
      } else {
        const impersonatorUser = state.impersonatorUser || state.user;
        return {
          ...state,
          impersonatorUser,
          user: action.payload.user,
        };
      }

    case SET_CURRENT_RESOURCE:
      return {
        ...state,
        resource: action.payload.resource,
      };

    default:
      return state;
  }
};
