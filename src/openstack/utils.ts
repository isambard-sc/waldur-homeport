import { ENV } from '@waldur/configs/default';
import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { ActionContext } from '@waldur/resource/actions/types';

import { listToDict } from '../core/utils';

const ipRegex = require('ip-regex');

const quotaNames = {
  storage: 'disk',
  vcpu: 'cores',
};

const parseQuotaName = (name) => quotaNames[name] || name;

export const parseQuotas = listToDict(
  (item) => parseQuotaName(item.name),
  (item) => item.limit,
);

export const parseQuotasUsage = listToDict(
  (item) => parseQuotaName(item.name),
  (item) => item.usage,
);

// Subnet is restricted with /24 prefix length.
export const SUBNET_PRIVATE_CIDR_PATTERN = new RegExp(
  // Class A
  '(^(10)(.([2]([0-5][0-5]|[01234][6-9])|[1][0-9][0-9]|[1-9][0-9]|[0-9])){2}.0/24$)' +
    // Class B
    '|(^(172).(1[6-9]|2[0-9]|3[0-1])(.(2[0-4][0-9]|25[0-5]|[1][0-9][0-9]|[1-9][0-9]|[0-9])).0/24$)' +
    // Class C
    '|(^(192).(168)(.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])).0/24$)',
);

const PRIVATE_CIDR_PATTERN = new RegExp(
  // Class A
  '(^(10)(.([2]([0-5][0-5]|[01234][6-9])|[1][0-9][0-9]|[1-9][0-9]|[0-9])){2}.([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/([89]|[12][0-9]|3[0-2])$)' +
    // Class B
    '|(^(172).(1[6-9]|2[0-9]|3[0-1])(.(2[0-4][0-9]|25[0-5]|[1][0-9][0-9]|[1-9][0-9]|[0-9])).([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/(1[2-9]|2[0-9]|3[0-2])$)' +
    // Class C
    '|(^(192).(168)(.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])).([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/(1[6-9]|2[0-9]|3[0-2])$)',
);

const VOLUME_NAME_PATTERN = new RegExp('^[A-Za-z0-9\\-]+$');

const IPv4_ADDRESS_PATTERN = ipRegex.v4({ exact: true });

export const validateIPv4 = (value) => {
  if (!value) {
    return;
  }
  if (!value.match(IPv4_ADDRESS_PATTERN)) {
    return translate('Enter IPv4 address.');
  }
};

export const validateSubnetPrivateCIDR = (value) => {
  if (!value) {
    return;
  }
  if (!value.match(SUBNET_PRIVATE_CIDR_PATTERN)) {
    return translate('Enter private IPv4 CIDR.');
  }
};

export const validatePrivateCIDR = (value) => {
  if (!value) {
    return;
  }
  if (!value.match(PRIVATE_CIDR_PATTERN)) {
    return translate('Enter private IPv4 CIDR.');
  }
};

export const validatePermissionsForConsoleAction = (ctx: ActionContext) => {
  if (ctx.user.is_staff) {
    return;
  }
  if (
    !ctx.user.is_support &&
    ENV.plugins.WALDUR_OPENSTACK_TENANT
      .ALLOW_CUSTOMER_USERS_OPENSTACK_CONSOLE_ACCESS
  ) {
    return;
  }
  return translate(
    'Only staff and organization users are allowed to open console.',
  );
};

const volumeName = (value: string) => {
  if (!value) {
    return undefined;
  }
  if (value.length < 2) {
    return translate(
      'Name is too short, names should be at least two alphanumeric characters.',
    );
  }
  if (!value.match(VOLUME_NAME_PATTERN)) {
    return translate(
      'Name should consist of latin symbols, numbers and dashes.',
    );
  }
};

export const getVolumeNameValidators = () => {
  const validators = [required];
  if (ENV.enforceLatinName) {
    validators.push(volumeName);
  }
  return validators;
};
