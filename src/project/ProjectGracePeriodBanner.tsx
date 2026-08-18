import { WarningIcon } from '@phosphor-icons/react';
import { DateTime } from 'luxon';
import { FC } from 'react';
import { Project } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { formatJsxTemplate, translate } from '@waldur/i18n';

export const ProjectGracePeriodBanner: FC<{ project: Project }> = ({
  project,
}) => {
  if (!project.is_in_grace_period || !project.end_date_with_grace) {
    return null;
  }

  const graceEnd = DateTime.fromISO(project.end_date_with_grace);
  const lastAccessDay = graceEnd.minus({ days: 1 });
  const contactBy = graceEnd.minus({ days: 10 });
  const rejectAfter = graceEnd.minus({ days: 5 });

  return (
    <div className="alert alert-danger d-flex gap-4 p-5 mb-5" role="alert">
      <WarningIcon size={32} weight="fill" className="flex-shrink-0" />
      <div className="text-dark">
        <h4 className="fw-bold mb-3">
          {translate(
            'Your award has finished and your project is now in its grace period.',
          )}
        </h4>
        <h4 className="fw-bold mb-3">
          {translate('You MUST start copying back your data NOW.')}
        </h4>
        <p className="mb-2">
          {translate(
            'Your last day to access your data will be {date}.',
            { date: <strong>{formatDate(lastAccessDay)}</strong> },
            formatJsxTemplate,
          )}
        </p>
        <p className="mb-2">
          {translate(
            'You will automatically LOSE ACCESS to your data on {date}, after which your data will be deleted automatically.',
            { date: <strong>{formatDate(graceEnd)}</strong> },
            formatJsxTemplate,
          )}
        </p>
        <div className="mb-1">
          {translate(
            "If you cannot copy back your data before {lastAccessDate} then you MUST contact your award's allocator before {contactByDate}.",
            {
              lastAccessDate: <strong>{formatDate(lastAccessDay)}</strong>,
              contactByDate: <strong>{formatDate(contactBy)}</strong>,
            },
            formatJsxTemplate,
          )}
        </div>
        <div className="mb-1">
          {translate(
            'They may be able to grant an extension of your grace period.',
          )}
        </div>
        <div className="mb-2">
          {translate(
            'They would need evidence that you have already started copying back your data.',
          )}
        </div>
        <p className="mb-0">
          {translate(
            'Requests to extend the grace period made after {date} will be rejected.',
            { date: <strong>{formatDate(rejectAfter)}</strong> },
            formatJsxTemplate,
          )}
        </p>
      </div>
    </div>
  );
};
