import { AzureSQLServerOffering } from '@waldur/azure/sql/marketplace';
import { AzureVirtualMachineOffering } from '@waldur/azure/vm/marketplace';
import { BookingOffering } from '@waldur/booking/marketplace';
import { RemoteOffering } from '@waldur/marketplace-remote/marketplace';
import { ScriptOffering } from '@waldur/marketplace-script/marketplace';
import { Offering, OfferingComponent } from '@waldur/marketplace/types';
import { OpenStackTenantOffering } from '@waldur/openstack/marketplace';
import { OpenStackInstanceOffering } from '@waldur/openstack/openstack-instance/marketplace';
import { OpenStackVolumeOffering } from '@waldur/openstack/openstack-volume/marketplace';
import { RancherOffering } from '@waldur/rancher/cluster/create/marketplace';
import { SlurmOffering, SlurmRemoteOffering } from '@waldur/slurm/marketplace';
import { BasicOffering, SupportOffering } from '@waldur/support/marketplace';
import { vmWareOffering } from '@waldur/vmware/marketplace';

import { OfferingConfiguration } from './types';

const REGISTRY: { [key: string]: Omit<OfferingConfiguration, 'type'> } = {};

export interface Option {
  value: string;
  label: string;
}

export function registerOfferingType(config: OfferingConfiguration) {
  const { type, ...rest } = config;
  REGISTRY[type] = rest;
}

export function getOrderFormComponent(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].orderFormComponent
  );
}

export function getDetailsComponent(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].detailsComponent
  );
}

export function getFormSerializer(offeringType: string) {
  return (
    (REGISTRY.hasOwnProperty(offeringType) &&
      REGISTRY[offeringType].serializer) ||
    ((x) => x)
  );
}

export function getFormLimitSerializer(offeringType: string) {
  return (
    (REGISTRY.hasOwnProperty(offeringType) &&
      REGISTRY[offeringType].limitSerializer) ||
    ((x) => x)
  );
}

export function getFormLimitParser(offeringType: string) {
  return (
    (REGISTRY.hasOwnProperty(offeringType) &&
      REGISTRY[offeringType].limitParser) ||
    ((x) => x)
  );
}

export function getCheckoutSummaryComponent(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].checkoutSummaryComponent
  );
}

export function getOfferingTypes(): Option[] {
  return Object.keys(REGISTRY)
    .map((key) => ({
      value: key,
      label: REGISTRY[key].label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getCreatableOfferings(): Option[] {
  const keys = Object.keys(REGISTRY).filter(
    (key) => !REGISTRY[key].disableOfferingCreation,
  );
  return keys
    .map((key) => ({
      value: key,
      label: REGISTRY[key].label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function showBackendId(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].showBackendId
  );
}

export function allowToUpdateService(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].allowToUpdateService
  );
}

export function hidePlanAddButton(offeringType: string, fields: Array<any>) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].onlyOnePlan &&
    fields.length
  );
}

export function isOfferingTypeSchedulable(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) && REGISTRY[offeringType].schedulable
  );
}

export function getPluginOptionsForm(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].pluginOptionsForm
  );
}

export function getSecretOptionsForm(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].secretOptionsForm
  );
}

export function getProvisioningConfigForm(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].provisioningConfigForm
  );
}

export function showComponentsList(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].showComponents
  );
}

export function getProviderType(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) && REGISTRY[offeringType].providerType
  );
}

export function getLabel(offeringType: string) {
  return (
    (REGISTRY.hasOwnProperty(offeringType) && REGISTRY[offeringType].label) ||
    offeringType
  );
}

function getOfferingComponentsFilter(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].offeringComponentsFilter
  );
}

export const filterOfferingComponents = (
  offering: Offering,
): OfferingComponent[] => {
  let offeringComponents: OfferingComponent[] = offering.components;
  const offeringComponentsFilter = getOfferingComponentsFilter(offering.type);
  if (offeringComponentsFilter) {
    offeringComponents = offeringComponentsFilter(offering, offeringComponents);
  }
  return offeringComponents;
};

registerOfferingType(AzureSQLServerOffering);
registerOfferingType(AzureVirtualMachineOffering);
registerOfferingType(RemoteOffering);
registerOfferingType(BookingOffering);
registerOfferingType(ScriptOffering);
registerOfferingType(OpenStackTenantOffering);
registerOfferingType(OpenStackInstanceOffering);
registerOfferingType(OpenStackVolumeOffering);
registerOfferingType(RancherOffering);
registerOfferingType(SlurmOffering);
registerOfferingType(SlurmRemoteOffering);
registerOfferingType(SupportOffering);
registerOfferingType(BasicOffering);
registerOfferingType(vmWareOffering);
