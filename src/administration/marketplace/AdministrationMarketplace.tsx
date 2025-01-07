import { useQuery } from '@tanstack/react-query';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { getDBSettings } from '../settings/api';
import { SettingsCard } from '../settings/SettingsCard';

export const AdministrationMarketplace = () => {
  const { data, error, isLoading, refetch } = useQuery(
    ['AdministrationMarketplace'],
    () => getDBSettings().then((response) => response.data),
  );

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load marketplace configuration.')}
        loadData={refetch}
      />
    );

  return data ? (
    <SettingsCard
      groupNames={[translate('Marketplace')]}
      settingsSource={data}
    />
  ) : null;
};
