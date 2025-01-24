import { useQuery } from '@tanstack/react-query';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { getDBSettings } from '../settings/api';
import { SettingsCard } from '../settings/SettingsCard';

export const AdministrationCustomScripts = () => {
  const { data, error, isLoading, refetch } = useQuery(
    ['AdministrationCustomScripts'],
    () => getDBSettings().then((response) => response.data),
  );

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load custom scripts configuration.')}
        loadData={refetch}
      />
    );

  return data ? (
    <SettingsCard
      groupNames={[translate('Custom Scripts')]}
      settingsSource={data}
    />
  ) : null;
};
