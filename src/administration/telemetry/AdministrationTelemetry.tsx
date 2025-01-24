import { useQuery } from '@tanstack/react-query';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { getDBSettings } from '../settings/api';
import { SettingsCard } from '../settings/SettingsCard';

export const AdministrationTelemetry = () => {
  const { data, error, isLoading, refetch } = useQuery(
    ['AdministrationTelemetry'],
    () => getDBSettings().then((response) => response.data),
  );

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load telemetry configuration.')}
        loadData={refetch}
      />
    );

  return data ? (
    <SettingsCard groupNames={[translate('Telemetry')]} settingsSource={data} />
  ) : null;
};
