import { Offering } from '@waldur/marketplace/types';

import * as constants from './constants';

export const updateOfferingState = (
  offering: Offering,
  stateAction: string,
  reason?: string,
  isPublic?: boolean,
  refreshOffering?: () => void,
) => ({
  type: constants.UPDATE_OFFERING_STATE,
  payload: {
    offering,
    stateAction,
    reason,
    isPublic,
    refreshOffering,
  },
});

export const addOfferingLocation = (offering: Offering) => ({
  type: constants.ADD_OFFERING_LOCATION,
  payload: {
    offering,
  },
});

export const loadDataSuccess = (data) => ({
  type: constants.LOAD_DATA_SUCCESS,
  payload: {
    ...data,
  },
});

export const googleCalendarSync = (uuid: string) => ({
  type: constants.GOOGLE_CALENDAR_SYNC,
  payload: {
    uuid,
  },
});

export const googleCalendarPublish = (uuid: string) => ({
  type: constants.GOOGLE_CALENDAR_PUBLISH,
  payload: {
    uuid,
  },
});

export const googleCalendarUnpublish = (uuid: string) => ({
  type: constants.GOOGLE_CALENDAR_UNPUBLISH,
  payload: {
    uuid,
  },
});

export const pullRemoteOfferingDetails = (uuid: string) => ({
  type: constants.PULL_REMOTE_OFFERING_DETAILS,
  payload: { uuid },
});

export const pullRemoteOfferingUsers = (uuid: string) => ({
  type: constants.PULL_REMOTE_OFFERING_USERS,
  payload: { uuid },
});

export const pushRemoteOfferingProjectData = (uuid: string) => ({
  type: constants.PUSH_REMOTE_OFFERING_PROJECT_DATA,
  payload: { uuid },
});

export const pullRemoteOfferingUsage = (uuid: string) => ({
  type: constants.PULL_REMOTE_OFFERING_USAGE,
  payload: { uuid },
});

export const pullRemoteOfferingResources = (uuid: string) => ({
  type: constants.PULL_REMOTE_OFFERING_RESOURCES,
  payload: { uuid },
});

export const pullRemoteOfferingOrderItems = (uuid: string) => ({
  type: constants.PULL_REMOTE_OFFERING_ORDER_ITEMS,
  payload: { uuid },
});

export const pullRemoteOfferingInvoices = (uuid: string) => ({
  type: constants.PULL_REMOTE_OFFERING_INVOICES,
  payload: { uuid },
});

export const pullRemoteOfferingRobotAccounts = (uuid: string) => ({
  type: constants.PULL_REMOTE_OFFERING_ROBOT_ACCOUNTS,
  payload: { uuid },
});
