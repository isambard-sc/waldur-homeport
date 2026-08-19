import { WarningIcon } from '@phosphor-icons/react';
import { DateTime } from 'luxon';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Project, projectsPartialUpdate } from 'waldur-js-client';

import { formatDate, formatISODate } from '@waldur/core/dateUtils';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { useNotify } from '@waldur/store/hooks';
import { setCurrentProject } from '@waldur/workspace/actions';
import { isOwnerOrStaffOrSupport } from '@waldur/workspace/selectors';

// Grace period length is currently fixed at 30 days; hardcoded rather than
// derived from end_date_with_grace so the preview stays correct even before
// the API round-trip that recomputes it server-side.
const GRACE_PERIOD_DAYS = 30;

export const ProjectGracePeriodBanner: FC<{ project: Project }> = ({
  project,
}) => {
  const dispatch = useDispatch();
  // Deliberately organisation owner / staff / support only — a plain
  // project-role member (e.g. project manager) can pass UPDATE_PROJECT at
  // the project scope, which is too broad for an action that reschedules
  // data deletion.
  const canExtendRole = useSelector(isOwnerOrStaffOrSupport);
  const { showSuccess, showErrorResponse } = useNotify();

  if (!project.is_in_grace_period || !project.end_date_with_grace) {
    return null;
  }

  const graceEnd = DateTime.fromISO(project.end_date_with_grace);
  const lastAccessDay = graceEnd.minus({ days: 1 });
  const contactBy = graceEnd.minus({ days: 10 });
  const rejectAfter = graceEnd.minus({ days: 5 });

  // The button can only ever push end_date to yesterday (the latest a
  // project can be backdated to while still counting as "ended"). If the
  // current end date is already yesterday or later, that would move it
  // earlier (or not at all), so there is nothing to extend.
  const today = DateTime.now().startOf('day');
  const currentEndDate = project.end_date
    ? DateTime.fromISO(project.end_date).startOf('day')
    : null;
  const newEndDate = today.minus({ days: 1 });
  const canExtendDate = Boolean(currentEndDate && currentEndDate < newEndDate);
  const canExtend = canExtendDate && canExtendRole;
  const newGraceEnd = newEndDate.plus({ days: GRACE_PERIOD_DAYS });

  const handleExtend = async () => {
    if (!canExtendDate) {
      return;
    }
    try {
      await waitForConfirmation(
        dispatch,
        translate('Extend grace period'),
        translate(
          "This will set the project's end date to {endDate}, extending the grace period to {graceEndDate} — the longest it can be extended to in one step.",
          {
            endDate: <strong>{formatDate(newEndDate)}</strong>,
            graceEndDate: <strong>{formatDate(newGraceEnd)}</strong>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    try {
      const response = await projectsPartialUpdate({
        path: { uuid: project.uuid },
        body: { end_date: formatISODate(newEndDate) },
      });
      dispatch(setCurrentProject(response.data as any as Project));
      showSuccess(
        translate('Grace period extended until {date}.', {
          date: formatDate(newGraceEnd),
        }),
      );
    } catch (e) {
      showErrorResponse(e, translate('Unable to extend the grace period.'));
    }
  };

  return (
    <div className="alert alert-danger d-flex gap-4 p-5 mb-5" role="alert">
      <WarningIcon size={32} weight="fill" className="flex-shrink-0" />
      <div className="text-dark flex-grow-1">
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
        <p className={canExtend ? 'mb-3' : 'mb-0'}>
          {translate(
            'Requests to extend the grace period made after {date} will be rejected.',
            { date: <strong>{formatDate(rejectAfter)}</strong> },
            formatJsxTemplate,
          )}
        </p>
        {canExtend && (
          <Button variant="primary" size="sm" onClick={handleExtend}>
            {translate('Extend grace period')}
          </Button>
        )}
      </div>
    </div>
  );
};
