import { DateTime } from 'luxon';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Project, projectsPartialUpdate } from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { formatDate, formatISODate } from '@/core/dateUtils';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { setCurrentProject } from '@/workspace/actions';
import { isOwnerOrStaff, isStaffOrSupport } from '@/workspace/selectors';

import {
  getGracePeriodNotice,
  GRACE_CHANGE_NOTICE_DAYS,
} from './gracePeriodNotice';

/**
 * The grace period a project actually gets: its own value if set, otherwise
 * the organisation's. Mirrors Project.get_grace_period_days() on the
 * mastermind side, which resolves the same two columns in the same order.
 *
 * This replaces the fork's hardcoded 30-day constant. Grace periods are now
 * configured per project with a customer-level fallback, so the length has to
 * be read rather than assumed — see docs/guides/resync-decisions.md.
 */
const getGracePeriodDays = (project: Project): number =>
  project.grace_period_days ?? project.customer_grace_period_days ?? 0;

export const ProjectGracePeriodBanner: FC<{ project: Project }> = ({
  project,
}) => {
  const dispatch = useDispatch();
  const { confirm } = useModal();
  // Deliberately organisation owner / staff / support only — a plain
  // project-role member (e.g. project manager) can pass UPDATE_PROJECT at
  // the project scope, which is too broad for an action that reschedules
  // data deletion. Upstream has no single selector for this set, so it is
  // composed the same way src/openportal/routes.ts composes it.
  const isOwnerOrStaffUser = useSelector(isOwnerOrStaff);
  const isStaffOrSupportUser = useSelector(isStaffOrSupport);
  const canExtendRole = isOwnerOrStaffUser || isStaffOrSupportUser;
  const { showSuccess, showErrorResponse } = useNotify();

  // Shown from the end date itself, not from is_in_grace_period — see
  // getGracePeriodNotice for why the two differ on that day.
  const notice = getGracePeriodNotice(project);
  if (!notice) {
    return null;
  }
  const { lastAccessDay, graceEnd, contactBy, window } = notice;

  const graceDays = getGracePeriodDays(project);
  const projectEnd = DateTime.fromISO(project.end_date).startOf('day');

  // The button can only ever push end_date to yesterday (the latest a
  // project can be backdated to while still counting as "ended"). If the
  // current end date is already yesterday or later, that would move it
  // earlier (or not at all), so there is nothing to extend.
  const today = DateTime.now().startOf('day');
  const newEndDate = today.minus({ days: 1 });
  const canExtendDate = Boolean(projectEnd < newEndDate && graceDays > 0);
  const canExtend = canExtendDate && canExtendRole;
  const newGraceEnd = newEndDate.plus({ days: graceDays });

  const handleExtend = async () => {
    if (!canExtendDate) {
      return;
    }
    try {
      await confirm(
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
    <AlertItem
      variant="error"
      className="mb-5"
      title={translate(
        'Your award has finished and your project is now in its grace period.',
      )}
      body={
        <>
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
          {/* Worded as the grace period emails word it, so a member reading
              both sees one rule and the same dates. */}
          {window === 'closed' ? (
            <p className="mb-0">
              {translate(
                'Your grace period cannot be extended, as changes to it need to be made at least {days} days before the data is scheduled for deletion. Please make sure that you have copied back all of your data by the end of {lastAccessDate}.',
                {
                  days: GRACE_CHANGE_NOTICE_DAYS,
                  lastAccessDate: <strong>{formatDate(lastAccessDay)}</strong>,
                },
                formatJsxTemplate,
              )}
            </p>
          ) : (
            <>
              <div className="mb-1">
                {translate(
                  'If you cannot copy back your data before {lastAccessDate} then you MUST contact the allocator of your project no later than {contactByDate}.',
                  {
                    lastAccessDate: (
                      <strong>{formatDate(lastAccessDay)}</strong>
                    ),
                    contactByDate: <strong>{formatDate(contactBy)}</strong>,
                  },
                  formatJsxTemplate,
                )}
              </div>
              {window === 'last-day' && (
                <div className="mb-1 fw-bold">
                  {translate(
                    'Today is the last day to ask the allocator for an extension.',
                  )}
                </div>
              )}
              <div className="mb-1">
                {translate(
                  'They may be able to grant an extension of your grace period.',
                )}
              </div>
              <div className="mb-0">
                {translate(
                  'They would need evidence that you have already started copying back your data.',
                )}
              </div>
            </>
          )}
        </>
      }
      actions={
        canExtend ? (
          <BaseButton
            variant="primary"
            size="sm"
            onClick={handleExtend}
            label={translate('Extend grace period')}
          />
        ) : undefined
      }
    />
  );
};
