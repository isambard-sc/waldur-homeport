import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { startCase } from 'lodash';
import React from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { getPublicOffering, getCategory, getPlugins } from '../common/api';

import { OfferingDetails } from './OfferingDetails';
import { getTabs } from './OfferingTabs';

async function loadData(offering_uuid: string) {
  const offering = await getPublicOffering(offering_uuid);
  const category = await getCategory(offering.category_uuid);
  const sections = category.sections;
  const tabs = getTabs({ offering, sections });
  const plugins = await getPlugins();
  const limits = plugins.find(
    (plugin) => plugin.offering_type === offering.type,
  ).available_limits;
  return { offering, tabs, limits };
}

export const OfferingDetailsPage: React.FC = () => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const router = useRouter();

  const { loading, value, error } = useAsync(
    () => loadData(offering_uuid),
    [offering_uuid],
  );

  useTitle(
    value?.offering?.category_title
      ? translate('Add {category}', {
          category: startCase(value.offering.category_title.toLowerCase()),
        })
      : translate('Add resource'),
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <h3>{translate('Unable to load offering details.')}</h3>;
  }

  if (value.offering.state !== 'Active') {
    router.stateService.go('errorPage.notFound');
    return null;
  }

  return (
    <OfferingDetails
      offering={value.offering}
      tabs={value.tabs}
      limits={value.limits}
    />
  );
};
