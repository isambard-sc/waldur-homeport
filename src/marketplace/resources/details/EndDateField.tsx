import { HelpIcon, WarningTip } from 'waldur-ui';

import {
  formatDate,
  formatRelativeEndDate,
  lastAccessDate,
} from '@/core/dateUtils';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

export const EndDateField = ({ resource }) => {
  const ownEndDate = resource.end_date;
  const projectEndDate = resource.project_end_date;
  // Backend-computed: the earliest of the resource's own end date and the
  // project-driven termination date, already grace-aware (incl. the offering's
  // disable-grace-period flag).
  const effectiveDate = resource.resource_effective_end_date;

  if (!effectiveDate) {
    return null;
  }

  // Parse to a Date: comparing the 'YYYY-MM-DD' string directly to a Date
  // coerces it to NaN, so the comparison would always be false.
  const isPastDate = new Date(effectiveDate) < new Date();

  const tooltipContent = (
    <div className="flex-grow-1">
      {/* Spelled out because the countdown beside the termination date runs to
          this day, not to the date itself, and that is worth being able to
          check. */}
      <div>
        {translate('Last day of access')}:{' '}
        {formatDate(lastAccessDate(effectiveDate))}
      </div>
      {ownEndDate && (
        <div>
          {translate('Resource termination date')}: {ownEndDate} (
          {formatRelativeEndDate(ownEndDate)})
        </div>
      )}
      {projectEndDate && (
        <div>
          {translate('Project end date')}: {projectEndDate} (
          {formatRelativeEndDate(projectEndDate)})
        </div>
      )}
    </div>
  );

  return (
    <Field
      label={translate('Termination date')}
      value={
        <span className={isPastDate ? 'text-danger' : ''}>
          {effectiveDate} ({formatRelativeEndDate(effectiveDate)}) &nbsp;
          {ownEndDate && ownEndDate > effectiveDate ? (
            <WarningTip
              label={
                <ul className="text-start mb-0">
                  <li>
                    {translate(
                      'Termination date exceeds project end date. Resource termination will start from the project end date.',
                    )}
                  </li>
                  <li>{translate('Resource will be terminated soon.')}</li>
                </ul>
              }
              className="ms-1"
              tooltipProps={{
                autoWidth: true,
                contentClassName: 'mw-275px',
              }}
            />
          ) : ownEndDate && projectEndDate ? (
            <HelpIcon label={tooltipContent} size={15} />
          ) : null}
        </span>
      }
    />
  );
};
