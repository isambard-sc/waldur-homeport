import { FC } from 'react';
import { OpenReturn } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';

import { isOverdue } from './permissions';

/**
 * Tells the applicant their proposal came back to them: when, why, and
 * until when they may resubmit. Past the deadline only the call managers
 * can extend it, so it says to ask them.
 */
export const ReturnedBanner: FC<{
  openReturn: OpenReturn;
  className?: string;
}> = ({ openReturn, className }) => {
  const overdue = isOverdue(openReturn.resubmit_by);
  return (
    <AlertItem
      variant={overdue ? 'error' : 'warning'}
      className={className}
      data-testid="returned-banner"
      title={
        overdue
          ? translate(
              'Returned to you by the call managers on {created}. The deadline to resubmit passed on {deadline}: ask the call managers to extend it.',
              {
                created: formatDateTime(openReturn.created),
                deadline: formatDateTime(openReturn.resubmit_by),
              },
            )
          : translate(
              'Returned to you by the call managers on {created} - resubmit by {deadline}.',
              {
                created: formatDateTime(openReturn.created),
                deadline: formatDateTime(openReturn.resubmit_by),
              },
            )
      }
      body={<span className="text-pre-wrap">{openReturn.reason}</span>}
    />
  );
};
