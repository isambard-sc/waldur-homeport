import { translate } from '@/i18n';
import { isProposalFormsEnabled } from '@/proposals/forms/proposalForms';

import { SettingsTab, SettingsWithTabs } from '../settings/SettingsWithTabs';

import { FormbricksConnectionCard } from './FormbricksConnectionCard';
import { FormFlowsCard } from './FormFlowsCard';

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
  return (
    <>
      <SettingsWithTabs
        title={translate('Call management settings')}
        tabs={CALL_MANAGEMENT_TABS}
        queryKey="AdministrationCallManagement"
        className="mb-5"
      />
      {/* Application forms through Formbricks: set up here once the
          proposal.formbricks_forms feature is on, before calls use them. */}
      {isProposalFormsEnabled() && (
        <>
          <FormbricksConnectionCard />
          <FormFlowsCard />
        </>
      )}
    </>
  );
};
