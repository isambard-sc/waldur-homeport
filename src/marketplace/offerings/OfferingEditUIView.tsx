import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import {
  getCategory,
  getProviderOffering,
  getPlugins,
} from '@waldur/marketplace/common/api';
import { Offering } from '@waldur/marketplace/types';
import { usePageHero } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/utils';

import {
  getPluginOptionsForm,
  getSecretOptionsForm,
  showComponentsList,
  showOfferingOptions,
} from '../common/registry';
import { ValidationIcon } from '../common/ValidationIcon';

import { OfferingViewHero } from './OfferingViewHero';
import { getServiceSettingsForm } from './update/integration/registry';
import { SCRIPT_ROWS } from './update/integration/utils';

const OverviewSection = lazyComponent(
  () => import('./update/overview/OverviewSection'),
  'OverviewSection',
);
const IntegrationSection = lazyComponent(
  () => import('./update/integration/IntegrationSection'),
  'IntegrationSection',
);
const OfferingEndpointsSection = lazyComponent(
  () => import('./update/endpoints/OfferingEndpointsSection'),
  'OfferingEndpointsSection',
);
const OfferingOptionsSection = lazyComponent(
  () => import('./update/options/OfferingOptionsSection'),
  'OfferingOptionsSection',
);
const OfferingResourceOptionsSection = lazyComponent(
  () => import('./update/options/OfferingResourceOptionsSection'),
  'OfferingResourceOptionsSection',
);
const AttributesSection = lazyComponent(
  () => import('./update/attributes/AttributesSection'),
  'AttributesSection',
);
const ComponentsSection = lazyComponent(
  () => import('./update/components/ComponentsSection'),
  'ComponentsSection',
);
const PlansSection = lazyComponent(
  () => import('./update/plans/PlansSection'),
  'PlansSection',
);
const OfferingImagesList = lazyComponent(
  () => import('./images/OfferingImagesList'),
  'OfferingImagesList',
);
const RolesSection = lazyComponent(
  () => import('./update/roles/RolesSection'),
  'RolesSection',
);

const getOfferingData = async (offering_uuid) => {
  const offering = await getProviderOffering(offering_uuid);
  const plugins = await getPlugins();
  const components = plugins.find(
    (plugin) => plugin.offering_type === offering.type,
  ).components;
  const category = await getCategory(offering.category_uuid);
  return { offering, category, components };
};

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export type OfferingData = Awaited<ReturnType<typeof getOfferingData>>;

const getTabs = (offering: Offering): PageBarTab[] => {
  const tabs: PageBarTab[] = [
    {
      key: 'general',
      component: OverviewSection,
      title: translate('General'),
    },
  ];

  // Integration
  const ServiceSettingsForm = getServiceSettingsForm(offering.type);
  const SecretOptionsForm = getSecretOptionsForm(offering.type);
  const PluginOptionsForm = getPluginOptionsForm(offering.type);

  if (ServiceSettingsForm || SecretOptionsForm || PluginOptionsForm) {
    tabs.push({
      key: 'integration',
      component: IntegrationSection,
      title: (
        <>
          <ValidationIcon
            value={
              offering.type !== OFFERING_TYPE_CUSTOM_SCRIPTS ||
              SCRIPT_ROWS.every(
                (option) => offering.secret_options[option.type],
              )
            }
          />
          {translate('Integration')}
        </>
      ),
    });
  }

  tabs.push({
    key: 'endpoints',
    component: OfferingEndpointsSection,
    title: translate('Endpoints'),
  });

  // Offering options & Resource options
  if (showOfferingOptions(offering.type)) {
    tabs.push(
      {
        key: 'options',
        component: OfferingOptionsSection,
        title: translate('User input'),
      },
      {
        key: 'resource_options',
        component: OfferingResourceOptionsSection,
        title: translate('Resource options'),
      },
    );
  }

  tabs.push({
    key: 'category',
    component: AttributesSection,
    title: translate('Category'),
  });

  // Components
  if (showComponentsList(offering.type)) {
    tabs.push({
      key: 'components',
      component: ComponentsSection,
      title: (
        <>
          <ValidationIcon value={offering.components.length > 0} />
          {translate('Accounting components')}
        </>
      ),
    });
  }

  tabs.push(
    {
      key: 'plans',
      component: PlansSection,
      title: (
        <>
          <ValidationIcon value={offering.plans.length > 0} />
          {translate('Accounting plans')}
        </>
      ),
    },
    {
      key: 'images',
      component: OfferingImagesList,
      title: translate('Images'),
    },
    { key: 'roles', component: RolesSection, title: translate('Roles') },
  );

  return tabs;
};

export const OfferingEditUIView = () => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const { data, isLoading, error, refetch, isRefetching } = useQuery(
    ['OfferingUpdateContainer', offering_uuid],
    () => getOfferingData(offering_uuid),
    { refetchOnWindowFocus: false },
  );

  useTitle(data ? data.offering.name : translate('Offering details'));

  const tabs = useMemo(
    () => (data?.offering ? getTabs(data.offering) : []),
    [data?.offering],
  );
  const { tabSpec } = usePageTabsTransmitter(tabs);

  usePageHero(
    <OfferingViewHero
      offeringUuid={offering_uuid}
      refetch={refetch}
      isRefetching={isRefetching}
    />,
    [offering_uuid, refetch, isRefetching],
  );

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component
          {...props}
          key={key}
          refetch={refetch}
          data={data}
          isLoading={isLoading}
          isRefetching={isRefetching}
          error={error}
          tabSpec={tabSpec}
        />
      )}
    />
  );
};
