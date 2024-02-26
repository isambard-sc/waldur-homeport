import React, { useState } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import {
  StepCardTabs,
  TabSpec,
} from '@waldur/marketplace/deploy/steps/StepCardTabs';
import { ProposalCall } from '@waldur/proposals/types';

import { CallInvitationsListPlaceholder } from './CallInvitationsListPlaceholder';
import { CallPermissionsLogList } from './CallPermissionsLogList';
import { CallUsersList } from './CallUsersList';

const tabs: TabSpec<{ call: ProposalCall }>[] = [
  { title: translate('Users'), key: 'users', component: CallUsersList },
  {
    title: translate('Permission log'),
    key: 'permissions',
    component: CallPermissionsLogList,
  },
  {
    title: translate('Invitations'),
    key: 'invitations',
    component: CallInvitationsListPlaceholder,
  },
];

export const CallReviewersSection = ({ call }) => {
  const [tab, setTab] = useState<TabSpec<{ call: ProposalCall }>>(tabs[0]);

  return (
    <Card>
      <Card.Header>
        <Card.Title>
          <h3>{translate('Reviewers')}</h3>
        </Card.Title>
        <div className="card-toolbar flex-grow-1 ms-6">
          <StepCardTabs tabs={tabs} tab={tab} setTab={setTab} />
        </div>
      </Card.Header>
      <Card.Body className="p-0 min-h-550px">
        {React.createElement(tab.component, { call })}
      </Card.Body>
    </Card>
  );
};
