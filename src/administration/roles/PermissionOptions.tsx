// WARNING: This file is auto-generated from src/waldur_core/core/management/commands/print_permissions_description.py
// Do not edit it manually. All manual changes would be overridden.
import { translate } from '@waldur/i18n';

export const PermissionOptions = [
  {
    label: translate('Offering'),
    options: [
      {
        label: translate('Create offering'),
        value: 'OFFERING.CREATE',
      },
      {
        label: translate('Delete offering'),
        value: 'OFFERING.DELETE',
      },
      {
        label: translate('Update offering thumbnail'),
        value: 'OFFERING.UPDATE_THUMBNAIL',
      },
      {
        label: translate('Update offering'),
        value: 'OFFERING.UPDATE',
      },
      {
        label: translate('Update offering attributes'),
        value: 'OFFERING.UPDATE_ATTRIBUTES',
      },
      {
        label: translate('Update offering location'),
        value: 'OFFERING.UPDATE_LOCATION',
      },
      {
        label: translate('Update offering description'),
        value: 'OFFERING.UPDATE_DESCRIPTION',
      },
      {
        label: translate('Update offering options'),
        value: 'OFFERING.UPDATE_OPTIONS',
      },
      {
        label: translate('Add offering endpoint'),
        value: 'OFFERING.ADD_ENDPOINT',
      },
      {
        label: translate('Delete offering endpoint'),
        value: 'OFFERING.DELETE_ENDPOINT',
      },
      {
        label: translate('Update offering components'),
        value: 'OFFERING.UPDATE_COMPONENTS',
      },
      {
        label: translate('Pause offering'),
        value: 'OFFERING.PAUSE',
      },
      {
        label: translate('Unpause offering'),
        value: 'OFFERING.UNPAUSE',
      },
      {
        label: translate('Archive offering'),
        value: 'OFFERING.ARCHIVE',
      },
      {
        label: translate('Dry run offering script'),
        value: 'OFFERING.DRY_RUN_SCRIPT',
      },
      {
        label: translate('Manage campaign'),
        value: 'OFFERING.MANAGE_CAMPAIGN',
      },
      {
        label: translate('Manage offering user group'),
        value: 'OFFERING.MANAGE_USER_GROUP',
      },
      {
        label: translate('Create offering plan'),
        value: 'OFFERING.CREATE_PLAN',
      },
      {
        label: translate('Update offering plan'),
        value: 'OFFERING.UPDATE_PLAN',
      },
      {
        label: translate('Archive offering plan'),
        value: 'OFFERING.ARCHIVE_PLAN',
      },
      {
        label: translate('Create offering screenshot'),
        value: 'OFFERING.CREATE_SCREENSHOT',
      },
      {
        label: translate('Update offering screenshot'),
        value: 'OFFERING.UPDATE_SCREENSHOT',
      },
      {
        label: translate('Delete offering screenshot'),
        value: 'OFFERING.DELETE_SCREENSHOT',
      },
      {
        label: translate('Create offering user'),
        value: 'OFFERING.CREATE_USER',
      },
      {
        label: translate('Update offering user'),
        value: 'OFFERING.UPDATE_USER',
      },
    ],
  },
  {
    label: translate('Order'),
    options: [
      {
        label: translate('Approve order'),
        value: 'ORDER.APPROVE',
      },
      {
        label: translate('Approve private order'),
        value: 'ORDER.APPROVE_PRIVATE',
      },
      {
        label: translate('Reject order'),
        value: 'ORDER.REJECT',
      },
      {
        label: translate('Destroy order'),
        value: 'ORDER.DESTROY',
      },
      {
        label: translate('Cancel order'),
        value: 'ORDER.CANCEL',
      },
    ],
  },
  {
    label: translate('Provider actions'),
    options: [
      {
        label: translate('Set resource usage'),
        value: 'RESOURCE.SET_USAGE',
      },
      {
        label: translate('Set resource backend id'),
        value: 'RESOURCE.SET_BACKEND_ID',
      },
      {
        label: translate('Submit resource report'),
        value: 'RESOURCE.SUBMIT_REPORT',
      },
      {
        label: translate('Set resource end date'),
        value: 'RESOURCE.SET_END_DATE',
      },
      {
        label: translate('Set resource state'),
        value: 'RESOURCE.SET_STATE',
      },
      {
        label: translate('Set resource backend metadata'),
        value: 'RESOURCE.SET_BACKEND_METADATA',
      },
      {
        label: translate('Create robot account'),
        value: 'RESOURCE.CREATE_ROBOT_ACCOUNT',
      },
      {
        label: translate('Update robot account'),
        value: 'RESOURCE.UPDATE_ROBOT_ACCOUNT',
      },
      {
        label: translate('Delete robot account'),
        value: 'RESOURCE.DELETE_ROBOT_ACCOUNT',
      },
      {
        label: translate('Manage resource users'),
        value: 'RESOURCE.MANAGE_USERS',
      },
      {
        label: translate('Get API secret code'),
        value: 'SERVICE_PROVIDER.GET_API_SECRET_CODE',
      },
      {
        label: translate('Generate API secret code'),
        value: 'SERVICE_PROVIDER.GENERATE_API_SECRET_CODE',
      },
      {
        label: translate('List service provider customers'),
        value: 'SERVICE_PROVIDER.LIST_CUSTOMERS',
      },
      {
        label: translate('List service provider customer projects'),
        value: 'SERVICE_PROVIDER.LIST_CUSTOMER_PROJECTS',
      },
      {
        label: translate('List service provider projects'),
        value: 'SERVICE_PROVIDER.LIST_PROJECTS',
      },
      {
        label: translate('List service provider project permissions'),
        value: 'SERVICE_PROVIDER.LIST_PROJECT_PERMISSIONS',
      },
      {
        label: translate('List service provider keys'),
        value: 'SERVICE_PROVIDER.LIST_KEYS',
      },
      {
        label: translate('List service provider users'),
        value: 'SERVICE_PROVIDER.LIST_USERS',
      },
      {
        label: translate('List service provider user customers'),
        value: 'SERVICE_PROVIDER.LIST_USER_CUSTOMERS',
      },
      {
        label: translate('Set offerings username'),
        value: 'SERVICE_PROVIDER.SET_OFFERINGS_USERNAME',
      },
      {
        label: translate('Get service provider statistics'),
        value: 'SERVICE_PROVIDER.GET_STATISTICS',
      },
      {
        label: translate('Get service provider revenue'),
        value: 'SERVICE_PROVIDER.GET_REVENUE',
      },
      {
        label: translate('Get service provider robot account customers'),
        value: 'SERVICE_PROVIDER.GET_ROBOT_ACCOUNT_CUSTOMERS',
      },
      {
        label: translate('Get service provider robot account projects'),
        value: 'SERVICE_PROVIDER.GET_ROBOT_ACCOUNT_PROJECTS',
      },
    ],
  },
  {
    label: translate('Customer actions for resources'),
    options: [
      {
        label: translate('Set resource end date'),
        value: 'RESOURCE.SET_END_DATE',
      },
      {
        label: translate('Terminate resource'),
        value: 'RESOURCE.TERMINATE',
      },
      {
        label: translate('List importable resources'),
        value: 'RESOURCE.LIST_IMPORTABLE',
      },
      {
        label: translate('Switch resource plan'),
        value: 'RESOURCE.SET_PLAN',
      },
      {
        label: translate('Update resource limits'),
        value: 'RESOURCE.SET_LIMITS',
      },
      {
        label: translate('Accept booking request'),
        value: 'RESOURCE.ACCEPT_BOOKING_REQUEST',
      },
      {
        label: translate('Reject booking request'),
        value: 'RESOURCE.REJECT_BOOKING_REQUEST',
      },
      {
        label: translate('Update resource options'),
        value: 'RESOURCE.UPDATE_OPTIONS',
      },
      {
        label: translate('Set resource consumption limitation'),
        value: 'RESOURCE.CONSUMPTION_LIMITATION',
      },
    ],
  },
  {
    label: translate('Team members'),
    options: [
      {
        label: translate('Create project permission'),
        value: 'PROJECT.CREATE_PERMISSION',
      },
      {
        label: translate('Create customer permission'),
        value: 'CUSTOMER.CREATE_PERMISSION',
      },
      {
        label: translate('Create offering permission'),
        value: 'OFFERING.CREATE_PERMISSION',
      },
      {
        label: translate('Update project permission'),
        value: 'PROJECT.UPDATE_PERMISSION',
      },
      {
        label: translate('Update customer permission'),
        value: 'CUSTOMER.UPDATE_PERMISSION',
      },
      {
        label: translate('Update offering permission'),
        value: 'OFFERING.UPDATE_PERMISSION',
      },
      {
        label: translate('Delete project permission'),
        value: 'PROJECT.DELETE_PERMISSION',
      },
      {
        label: translate('Delete customer permission'),
        value: 'CUSTOMER.DELETE_PERMISSION',
      },
      {
        label: translate('Delete offering permission'),
        value: 'OFFERING.DELETE_PERMISSION',
      },
    ],
  },
  {
    label: translate('Project'),
    options: [
      {
        label: translate('Create project'),
        value: 'PROJECT.CREATE',
      },
      {
        label: translate('Update project'),
        value: 'PROJECT.UPDATE',
      },
      {
        label: translate('Delete project'),
        value: 'PROJECT.DELETE',
      },
    ],
  },
];
