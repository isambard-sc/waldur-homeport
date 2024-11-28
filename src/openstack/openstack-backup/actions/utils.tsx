import { translate } from '@waldur/i18n';
import {
  BackupRestoreRequestBody,
  loadFlavors,
  loadFloatingIps,
  loadSecurityGroups,
  loadSubnets,
} from '@waldur/openstack/api';
import {
  formatFlavorTitle,
  formatSubnet,
} from '@waldur/openstack/openstack-instance/utils';

import { OpenStackBackup } from '../types';

const AUTO_ASSIGN_FLOATING_IP = 'AUTO_ASSIGN_FLOATING_IP';

export const SKIP_FLOATING_IP_ASSIGNMENT = 'SKIP_FLOATING_IP_ASSIGNMENT';

interface Option {
  label: string;
  value: string;
}

export interface BackupFormChoices {
  securityGroups: Option[];
  flavors: Option[];
  subnets: Option[];
  floatingIps: Option[];
}

interface BackupNetworkType {
  subnet: string;
  floating_ip: string;
}

export interface BackupRestoreFormData {
  flavor: Option;
  security_groups: Option[];
  networks: BackupNetworkType[];
}

export const loadData = async (
  resource: OpenStackBackup,
): Promise<BackupFormChoices> => {
  const [flavors, securityGroups, floatingIps, subnets] = await Promise.all([
    loadFlavors({
      tenant_uuid: resource.tenant_uuid,
      fields: ['url', 'name', 'cores', 'ram'],
    }),
    loadSecurityGroups({
      tenant_uuid: resource.tenant_uuid,
      fields: ['url', 'name'],
    }),
    loadFloatingIps({
      tenant_uuid: resource.tenant_uuid,
      free: 'True',
      fields: ['url', 'address'],
    }),
    loadSubnets({
      tenant_uuid: resource.tenant_uuid,
      fields: ['url', 'name', 'cidr'],
    }),
  ]);

  return {
    securityGroups: securityGroups.map((choice) => ({
      value: choice.url,
      label: choice.name,
    })),
    flavors: flavors.map((flavor) => ({
      label: formatFlavorTitle(flavor),
      value: flavor.url,
    })),
    subnets: [
      {
        label: translate('Select connected subnet'),
        value: '',
      },
      ...subnets.map((subnet) => ({
        label: formatSubnet(subnet),
        value: subnet.url,
      })),
    ],
    floatingIps: [
      {
        value: SKIP_FLOATING_IP_ASSIGNMENT,
        label: translate('Skip floating IP assignment'),
      },
      {
        value: AUTO_ASSIGN_FLOATING_IP,
        label: translate('Auto-assign floating IP'),
      },
      ...floatingIps.map((floating_ip) => ({
        label: floating_ip.address,
        value: floating_ip.url,
      })),
    ],
  };
};

export const getInitialValues = (
  resource: OpenStackBackup,
): Partial<BackupRestoreFormData> => ({
  security_groups: resource.instance_security_groups.map((choice) => ({
    value: choice.url,
    label: choice.name,
  })),
  networks: resource.instance_ports
    ? resource.instance_ports.map((item) => ({
        floating_ip: SKIP_FLOATING_IP_ASSIGNMENT,
        subnet: item.subnet,
      }))
    : [],
});

export const serializeBackupRestoreFormData = (
  form: BackupRestoreFormData,
): BackupRestoreRequestBody => ({
  flavor: form.flavor.value,
  ports: form.networks
    .filter((item) => item.subnet)
    .map((item) => ({
      subnet: item.subnet,
    })),
  floating_ips: form.networks
    .filter(
      (item) => item.subnet && item.floating_ip !== SKIP_FLOATING_IP_ASSIGNMENT,
    )
    .map((item) => {
      // Auto-assign floating IP
      if (item.floating_ip === AUTO_ASSIGN_FLOATING_IP) {
        return {
          subnet: item.subnet,
        };
      } else {
        return {
          subnet: item.subnet,
          url: item.floating_ip,
        };
      }
    }),
  security_groups: form.security_groups.map(({ value }) => ({
    url: value,
  })),
});

export function hasFreeSubnets(
  subnets: Option[],
  networks: BackupNetworkType[],
) {
  return (
    subnets.length - 1 > networks.filter((network) => network.subnet).length
  );
}

export function getFreeSubnets(
  subnets: Option[],
  networks: BackupNetworkType[],
  currentNetwork: BackupNetworkType,
): Option[] {
  const usedSubnets = {};
  networks.forEach((network) => {
    if (network.subnet) {
      usedSubnets[network.subnet] = true;
    }
  });
  return subnets.filter(
    (subnet) =>
      !usedSubnets[subnet.value] || subnet.value === currentNetwork.subnet,
  );
}

export function getFreeFloatingIps(
  floatingIps: Option[],
  networks: BackupNetworkType[],
  currentNetwork: BackupNetworkType,
): Option[] {
  const usedFloatingIps = {};
  networks.forEach((network) => {
    if (
      network.floating_ip &&
      network.floating_ip !== AUTO_ASSIGN_FLOATING_IP
    ) {
      usedFloatingIps[network.floating_ip] = true;
    }
  });
  return floatingIps.filter(
    (floatingIp) =>
      !usedFloatingIps[floatingIp.value] ||
      floatingIp.value === currentNetwork.floating_ip,
  );
}
