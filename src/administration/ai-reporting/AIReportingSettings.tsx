import { translate } from '@/i18n';

import { SettingsWithTabs } from '../settings/SettingsWithTabs';

import { HarnessConnectionFields } from './HarnessConnectionFields';

// Split into tabs (Connection/General/Limits/Retention) rather than one long
// stacked page: 14 Constance settings plus the 2 connection fields is the
// same kind of crowding AdministrationSoftwareCatalog.tsx's own
// general/EESSI/Spack tabs were split to avoid. The backend fieldset split
// (constance_settings.py's "AI reporting general"/"limits"/"retention", was
// one "AI reporting settings" fieldset) and the regenerated
// SettingsDescription.ts both have to match the groupName values used below.
export const AIReportingSettings = () => (
  <SettingsWithTabs
    title={translate('AI reporting settings')}
    queryKey="AIReportingSettings"
    tabs={[
      {
        key: 'connection',
        title: translate('Connection'),
        content: <HarnessConnectionFields />,
      },
      {
        key: 'general',
        title: translate('General'),
        groupName: translate('AI reporting general'),
      },
      {
        key: 'limits',
        title: translate('Limits'),
        groupName: translate('AI reporting limits'),
      },
      {
        key: 'retention',
        title: translate('Retention'),
        groupName: translate('AI reporting retention'),
      },
    ]}
  />
);
