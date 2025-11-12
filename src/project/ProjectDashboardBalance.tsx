import { Project } from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { WidgetCard } from '@waldur/dashboard/WidgetCard';
import { translate } from '@waldur/i18n';
import { formatDate } from '@waldur/core/dateUtils';

import { useProjectCreditChart } from './utils';

export const ProjectDashboardBalance = ({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) => {
  const { credit, chart, options, error, isLoading, refetch } =
    useProjectCreditChart(project);

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return (
      <LoadingErred
        message={translate('Unable to load data.')}
        loadData={refetch}
      />
    );
  }

  // If project is in grace period, show grace warning instead of normal accounting info
  if (project.is_in_grace_period && project.end_date_with_grace) {
    return (
      <WidgetCard
        cardTitle={
          <>
            {translate('Accounting')}
          </>
        }
        className="h-100"
      >
        <div className="alert alert-danger mb-0">
          <p className="mb-2">
            <strong>
              {translate(
                'This project has finished and is now in its grace period.',
              )}
            </strong>
          </p>
          <p className="mb-2">
            {translate(
              'You will lose access to this project and all of its resources on:',
            )}{' '}
            <strong>{formatDate(new Date(project.end_date_with_grace))}</strong>
          </p>
          <hr />
          <p className="mb-0">
            <strong>{translate('Warning:')}</strong>{' '}
            {translate(
              'All project data will be permanently deleted after the grace period ends. Please ensure you have backed up any important data.',
            )}
          </p>
        </div>
      </WidgetCard>
    );
  }

  // Normal accounting display when not in grace period
  const balance = credit?.value || 0;
  const estimate = (project.billing_price_estimate &&
    project.billing_price_estimate.total) || 0;
  let estimated_balance = balance - estimate;

  let warning = null;

  if (estimated_balance <= 0) {
    estimated_balance = 0;

    warning = (
      <span className="text-danger">
        {translate('Warning: Your estimated balance is now zero. You will not be able to consume any more resources.')}
      </span>
    );
  } else if (estimated_balance < 0.1 * balance) {
    warning = (
      <span className="text-warning">
        {translate('Warning: Your estimated balance is low.')}
      </span>
    );
  }

  return (
    <WidgetCard
      cardTitle={
        <>
          {translate('Accounting')}
        </>
      }
      className="h-100"
    >
      <p>
        <ul>
          <li>
            {translate('Balance at start of month')}: {defaultCurrency(balance)}
          </li>
          <li>
            {translate('Estimated spend this month')}: {defaultCurrency(estimate)}
          </li>
          <li>
            {translate('Estimated balance at the end of this month')}: {defaultCurrency(estimated_balance)}
          </li>
        </ul>
      </p>
      {warning && <div className="mt-2">{warning}</div>}
    </WidgetCard>
  );
};
