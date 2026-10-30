import { FC } from 'react';
import { OpenReturn, ProposalStates } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { formatDateTimeWithZone } from '@/core/dateUtils';
import { translate } from '@/i18n';

import { HeldDecisionBadge } from '../manage/HeldDecisionBadge';
import { isOverdue } from '../returns/permissions';

import { ProposalBadge } from './ProposalBadge';

/** A draft back with its applicant: until when, or that the date passed. */
const ReturnedBadge: FC<{ openReturn: OpenReturn }> = ({ openReturn }) =>
  isOverdue(openReturn.resubmit_by) ? (
    <Badge variant="danger" shape="pill">
      {translate('Overdue since {date}', {
        date: formatDateTimeWithZone(openReturn.resubmit_by),
      })}
    </Badge>
  ) : (
    <Badge variant="warning" shape="pill">
      {translate('Returned, due {date}', {
        date: formatDateTimeWithZone(openReturn.resubmit_by),
      })}
    </Badge>
  );

/**
 * A proposal's state in the call team's lists. A decision held for the
 * round's publication shows its tentative outcome instead; `decision_held`
 * is null for everyone outside the call team, who keep seeing the proposal
 * in review. A draft returned to its applicant says until when, or that its
 * deadline has passed.
 */
export const ProposalStateBadge: FC<{
  row: {
    uuid: string;
    state: ProposalStates;
    decision_held?: boolean | null;
    open_return?: OpenReturn | null;
  };
}> = ({ row }) =>
  row.decision_held === true ? (
    <HeldDecisionBadge proposalUuid={row.uuid} />
  ) : row.open_return ? (
    <span className="d-inline-flex flex-wrap gap-1">
      <ProposalBadge state={row.state} />
      <ReturnedBadge openReturn={row.open_return} />
    </span>
  ) : (
    <ProposalBadge state={row.state} />
  );
