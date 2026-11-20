import { useMemo } from 'react';

import { translate } from '@/i18n';
import { isProposalFormsEnabled } from '@/proposals/forms/proposalForms';

import { SettingsTab, SettingsWithTabs } from '../settings/SettingsWithTabs';

import { FormbricksConnectionCard } from './FormbricksConnectionCard';
import { FormFlowsCard } from './FormFlowsCard';
import { SiteClosingFlowCard } from './SiteClosingFlowCard';

const CALL_MANAGEMENT_TABS: SettingsTab[] = [
  {
    key: 'proposal',
    title: translate('Proposal'),
    groupName: translate('Proposal settings'),
  },
  {
    key: 'orcid',
    title: translate('ORCID integration'),
    groupName: translate('ORCID integration settings'),
  },
  {
    key: 'publication',
    title: translate('Publication API'),
    groupName: translate('Publication API settings'),
  },
];

export const AdministrationCallManagement = () => {
  // Application forms through Formbricks have their own API rather than
  // being site settings, so their tab carries its own content. Shown only
  // once the proposal.formbricks_forms feature is on.
  const tabs = useMemo<SettingsTab[]>(
    () =>
      isProposalFormsEnabled()
        ? [
            ...CALL_MANAGEMENT_TABS,
            {
              key: 'application-forms',
              title: translate('Application forms'),
              content: (
                <>
                  <FormbricksConnectionCard />
                  <FormFlowsCard />
                  <SiteClosingFlowCard />
                </>
              ),
            },
          ]
        : CALL_MANAGEMENT_TABS,
    [],
  );

  return (
    <SettingsWithTabs
      title={translate('Call management settings')}
      tabs={tabs}
      queryKey="AdministrationCallManagement"
    />
  );
};
