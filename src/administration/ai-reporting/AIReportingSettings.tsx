import { translate } from '@/i18n';

import { SettingsWithTabs } from '../settings/SettingsWithTabs';

import { HarnessConnectionFields } from './HarnessConnectionFields';

// The groupName values must match the AI reporting fieldsets in
// constance_settings.py, and so the generated SettingsDescription.ts.
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
