import { UISref } from '@uirouter/react';

import { EventGroup } from '@waldur/events/types';
import { getCallerContext } from '@waldur/events/utils';
import { translate } from '@waldur/i18n';

import { SupportEnum } from '../EventsEnums';

const getIssueContext = (event) => ({
  ...getCallerContext(event),
  issue_link: (
    <UISref to="support.detail" params={{ uuid: event.issue_uuid }}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a>{event.issue_key}</a>
    </UISref>
  ),
});

export const IssueEvents: EventGroup = {
  title: translate('Support request events'),
  context: getIssueContext,
  events: [
    {
      key: SupportEnum.issue_creation_succeeded,
      title: translate('Issue {issue_link} has been created by {caller_link}.'),
    },
  ],
};
